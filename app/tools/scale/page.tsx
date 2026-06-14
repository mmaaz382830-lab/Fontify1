'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  SlidersHorizontal,
  Eye,
  Copy,
  Check,
  Ruler,
  Bookmark,
  Trash2,
  Loader2,
} from 'lucide-react'
import ToolNav from '@/components/tool-nav'
import { getPresets, savePreset, deletePreset } from './actions'
import type { ScalePreset } from '@/utils/supabase/types'

type ExportFormat = 'tailwind' | 'css'
type Unit = 'px' | 'rem'

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

const RATIOS = [
  { label: 'Major Third', value: 1.25 },
  { label: 'Perfect Fourth', value: 1.333 },
  { label: 'Golden Ratio', value: 1.618 },
] as const

type StepDef = {
  key: string
  label: string
  tag: 'h1' | 'h2' | 'h3' | 'p' | 'small'
  step: number
  isHeading: boolean
}

const STEPS: StepDef[] = [
  { key: 'h1', label: 'H1', tag: 'h1', step: 3, isHeading: true },
  { key: 'h2', label: 'H2', tag: 'h2', step: 2, isHeading: true },
  { key: 'h3', label: 'H3', tag: 'h3', step: 1, isHeading: true },
  { key: 'body', label: 'Body', tag: 'p', step: 0, isHeading: false },
  { key: 'small', label: 'Small', tag: 'small', step: -1, isHeading: false },
]

// Heading line-height multiplier (spec: 1.2 * heading size).
const HEADING_LH = 1.2
// Body line-height multiplier (spec: 1.5 * base size).
const BODY_LH = 1.5
// How much the type-scale ratio is compressed at the smallest viewport.
// minRatio = 1 + (ratio - 1) * COMPRESSION  ->  headings shrink on mobile,
// body (step 0) stays exactly at the base size at every viewport.
const COMPRESSION = 0.8

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const round = (n: number, d = 2) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

const REM_BASE = 16
const toRem = (px: number) => round(px / REM_BASE, 4)

/**
 * Builds a fluid `clamp()` that interpolates linearly from `minSize` at
 * `minVw` to `maxSize` at `maxVw`. Sizes are emitted in px or rem.
 *   px:  clamp(MINpx,  interceptpx  + slope·100vw, MAXpx)
 *   rem: clamp(MINrem, interceptrem + slope·100vw, MAXrem)
 *
 * Note: the viewport (vw) term is unit-agnostic, so only the min, max and
 * intercept switch units between px and rem.
 */
function buildClamp(
  minSize: number,
  maxSize: number,
  minVw: number,
  maxVw: number,
  unit: Unit = 'px'
): string {
  const fmt = (px: number) => (unit === 'rem' ? `${toRem(px)}rem` : `${round(px)}px`)

  if (Math.abs(maxSize - minSize) < 0.001 || maxVw === minVw) {
    return fmt(maxSize)
  }
  const slope = (maxSize - minSize) / (maxVw - minVw)
  const intercept = minSize - slope * minVw
  const slopeVw = round(slope * 100, 3)
  return `clamp(${fmt(minSize)}, ${fmt(intercept)} + ${slopeVw}vw, ${fmt(maxSize)})`
}

type Token = {
  key: string
  label: string
  tag: StepDef['tag']
  step: number
  isHeading: boolean
  minSize: number
  maxSize: number
  clamp: string
  lineHeight: number // unitless
  lineHeightPx: number // computed against max size
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ScalePage() {
  const [base, setBase] = useState(16)
  const [ratio, setRatio] = useState<number>(1.25)
  const [minVw, setMinVw] = useState(320)
  const [maxVw, setMaxVw] = useState(1440)
  const [unit, setUnit] = useState<Unit>('px')
  const [format, setFormat] = useState<ExportFormat>('tailwind')
  const [copied, setCopied] = useState(false)

  // Supabase presets
  const [presets, setPresets] = useState<ScalePreset[]>([])
  const [presetsLoading, setPresetsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const minRatio = useMemo(() => 1 + (ratio - 1) * COMPRESSION, [ratio])

  const tokens: Token[] = useMemo(() => {
    return STEPS.map((s) => {
      const maxSize = base * ratio ** s.step
      const minSize = base * minRatio ** s.step
      const lineHeight = s.isHeading ? HEADING_LH : BODY_LH
      return {
        ...s,
        minSize,
        maxSize,
        clamp: buildClamp(minSize, maxSize, minVw, maxVw, unit),
        lineHeight,
        lineHeightPx: round(lineHeight * maxSize),
      }
    })
  }, [base, ratio, minRatio, minVw, maxVw, unit])

  // Spacing tokens = strict multiples of the body line-height (1.5 * base).
  const bodyLineHeightPx = useMemo(() => round(BODY_LH * base), [base])
  const spacing = useMemo(
    () =>
      [1, 2, 3, 4, 6, 8].map((m) => ({
        name: `x${m}`,
        px: round(bodyLineHeightPx * m),
      })),
    [bodyLineHeightPx]
  )

  const spacingValue = (px: number) =>
    unit === 'rem' ? `${toRem(px)}rem` : `${round(px)}px`

  /* ----- Tailwind export ------------------------------------------------- */
  const tailwindConfig = useMemo(() => {
    const fontLines = tokens
      .map(
        (t) =>
          `      '${t.key}': ['${t.clamp}', { lineHeight: '${t.lineHeight}' }],`
      )
      .join('\n')

    const spacingLines = spacing
      .map((s) => `      '${s.name}': '${spacingValue(s.px)}', // ${s.px}px`)
      .join('\n')

    return `// tailwind.config.{js,ts}
module.exports = {
  theme: {
    extend: {
      fontSize: {
${fontLines}
      },
      spacing: {
${spacingLines}
      },
    },
  },
}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, spacing, unit])

  /* ----- CSS variables export -------------------------------------------- */
  const cssConfig = useMemo(() => {
    const fontVars = tokens
      .map((t) => `  --font-size-${t.key}: ${t.clamp};`)
      .join('\n')
    const lhVars = tokens
      .map((t) => `  --line-height-${t.key}: ${t.lineHeight};`)
      .join('\n')
    const spaceVars = spacing
      .map((s) => `  --space-${s.name}: ${spacingValue(s.px)};`)
      .join('\n')

    return `:root {
  /* Fluid font sizes */
${fontVars}

  /* Line heights */
${lhVars}

  /* Spacing scale (multiples of body line-height) */
${spaceVars}
}

h1 { font-size: var(--font-size-h1); line-height: var(--line-height-h1); }
h2 { font-size: var(--font-size-h2); line-height: var(--line-height-h2); }
h3 { font-size: var(--font-size-h3); line-height: var(--line-height-h3); }
p  { font-size: var(--font-size-body); line-height: var(--line-height-body); }
small { font-size: var(--font-size-small); line-height: var(--line-height-small); }`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, spacing, unit])

  const exportCode = format === 'tailwind' ? tailwindConfig : cssConfig
  const exportLabel =
    format === 'tailwind' ? 'theme.extend.fontSize' : ':root variables'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea')
      el.value = exportCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  /* ----- Presets (Supabase) ---------------------------------------------- */
  const loadPresets = async () => {
    setPresetsLoading(true)
    const rows = await getPresets()
    setPresets(rows)
    setPresetsLoading(false)
  }

  useEffect(() => {
    loadPresets()
  }, [])

  const handleSavePreset = async () => {
    setSaving(true)
    const ratioLabel =
      RATIOS.find((r) => r.value === ratio)?.label ?? `${ratio}`
    const res = await savePreset({
      name: `${ratioLabel} · ${base}px`,
      base,
      ratio,
      min_vw: minVw,
      max_vw: maxVw,
    })
    setSaving(false)
    if (res.ok) {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
      loadPresets()
    }
  }

  const handleDeletePreset = async (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
    await deletePreset(id)
  }

  const applyPreset = (p: ScalePreset) => {
    setBase(p.base)
    setRatio(p.ratio)
    setMinVw(p.min_vw)
    setMaxVw(p.max_vw)
  }

  /* ----------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <title>Fluid Scale Calculator — Fontify</title>
      <ToolNav />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
        {/* ----------------------------- Control Panel ---------------------- */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <SlidersHorizontal className="h-4 w-4" />
              Controls
            </div>

            {/* Base size */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <label htmlFor="base" className="text-neutral-500 dark:text-neutral-400">
                  Base font size
                </label>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">{base}px</span>
              </div>
              <input
                id="base"
                type="range"
                min={14}
                max={20}
                step={1}
                value={base}
                onChange={(e) => setBase(Number(e.target.value))}
                className="w-full accent-neutral-900 dark:accent-neutral-100"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400 dark:text-neutral-600">
                <span>14</span>
                <span>20</span>
              </div>
            </div>

            {/* Ratio */}
            <div className="mb-6">
              <label
                htmlFor="ratio"
                className="mb-2 block text-sm text-neutral-500 dark:text-neutral-400"
              >
                Type scale ratio
              </label>
              <select
                id="ratio"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-600"
              >
                {RATIOS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Viewports */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="minvw"
                  className="mb-2 block text-sm text-neutral-500 dark:text-neutral-400"
                >
                  Min viewport
                </label>
                <div className="relative">
                  <input
                    id="minvw"
                    type="number"
                    value={minVw}
                    min={200}
                    max={maxVw - 1}
                    onChange={(e) => setMinVw(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 pr-9 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-600"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 dark:text-neutral-600">
                    px
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="maxvw"
                  className="mb-2 block text-sm text-neutral-500 dark:text-neutral-400"
                >
                  Max viewport
                </label>
                <div className="relative">
                  <input
                    id="maxvw"
                    type="number"
                    value={maxVw}
                    min={minVw + 1}
                    max={3840}
                    onChange={(e) => setMaxVw(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 pr-9 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-600"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 dark:text-neutral-600">
                    px
                  </span>
                </div>
              </div>
            </div>

            {/* Unit toggle */}
            <div className="mt-6">
              <span className="mb-2 block text-sm text-neutral-500 dark:text-neutral-400">
                Output unit
              </span>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1">
                {(['px', 'rem'] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`rounded-md py-1.5 text-sm font-medium transition ${
                      unit === u
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Scale table */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Ruler className="h-4 w-4" />
              Computed scale
            </div>
            <div className="space-y-2.5">
              {tokens.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-neutral-500 dark:text-neutral-400">{t.label}</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {round(t.minSize)} → {round(t.maxSize)}px
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <p className="mb-2 text-xs font-medium text-neutral-500">
                Spacing (× body line-height {bodyLineHeightPx}px)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {spacing.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-md bg-neutral-200/70 dark:bg-neutral-800/70 px-2 py-1 font-mono text-[11px] text-neutral-700 dark:text-neutral-300"
                  >
                    {s.name}:{s.px}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Export */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            <span className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Export
            </span>
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1">
              {(
                [
                  ['tailwind', 'Tailwind'],
                  ['css', 'CSS Variables'],
                ] as [ExportFormat, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-md py-1.5 text-sm font-medium transition ${
                    format === f
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white px-4 py-3 text-sm font-medium text-white dark:text-neutral-900 transition hover:bg-neutral-800 dark:hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy{' '}
                  {format === 'tailwind' ? 'Tailwind Config' : 'CSS'}
                </>
              )}
            </button>
          </section>

          {/* Presets (Supabase) */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Bookmark className="h-4 w-4" />
              Presets
            </div>

            <button
              onClick={handleSavePreset}
              disabled={saving}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 px-3 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : justSaved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {justSaved ? 'Saved!' : 'Save current preset'}
            </button>

            {presetsLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </div>
            ) : presets.length === 0 ? (
              <p className="text-xs leading-relaxed text-neutral-500">
                No presets yet. Sign in and hit{' '}
                <span className="text-neutral-700 dark:text-neutral-300">Save current preset</span> to
                store your scale.
              </p>
            ) : (
              <ul className="space-y-2">
                {presets.map((p) => (
                  <li
                    key={p.id}
                    className="group flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2"
                  >
                    <button
                      onClick={() => applyPreset(p)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {p.name}
                      </div>
                      <div className="truncate font-mono text-[11px] text-neutral-500">
                        {p.base}px · {p.ratio} · {p.min_vw}→{p.max_vw}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeletePreset(p.id)}
                      title="Delete"
                      className="shrink-0 rounded-md p-1.5 text-neutral-400 dark:text-neutral-600 transition hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        {/* ----------------------------- Live Preview ----------------------- */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-8 sm:p-10">
            <div className="mb-8 flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              <Eye className="h-4 w-4" />
              Live preview
              <span className="ml-auto font-mono text-[11px] text-neutral-400 dark:text-neutral-600">
                resize the window to see the fluidity
              </span>
            </div>

            <div className="space-y-6">
              {tokens.map((t) => {
                const Tag = t.tag
                return (
                  <div key={t.key}>
                    <div className="mb-1.5 font-mono text-[11px] text-neutral-400 dark:text-neutral-600">
                      {t.label} · clamp · lh {t.lineHeight}
                    </div>
                    <Tag
                      style={{
                        fontSize: t.clamp,
                        lineHeight: t.lineHeight,
                        fontWeight: t.isHeading ? 600 : 400,
                        letterSpacing: t.isHeading ? '-0.02em' : undefined,
                        margin: 0,
                        display: 'block',
                        color: t.tag === 'small' ? '#a3a3a3' : '#fafafa',
                      }}
                    >
                      {t.isHeading
                        ? 'The quick brown fox'
                        : 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.'}
                    </Tag>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Generated config preview */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-3">
              <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {exportLabel}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 transition hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              <code>{exportCode}</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}
