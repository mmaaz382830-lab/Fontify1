'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import * as opentype from 'opentype.js'
import {
  UploadCloud,
  FileType2,
  Copy,
  Check,
  AlertTriangle,
  Sliders,
  Hash,
  Copyright,
  RotateCcw,
  X,
} from 'lucide-react'
import ToolNav from '@/components/tool-nav'

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */

interface Axis {
  tag: string
  name: string
  min: number
  max: number
  default: number
}

interface FontInfo {
  name: string
  copyright: string
  glyphCount: number
  unitsPerEm: number
  isVariable: boolean
  axes: Axis[]
  // The CSS family name + an object URL used to actually load the font face.
  cssFamily: string
  fontUrl: string
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

// opentype.js stores localized names as { en: '...', ... }. Grab the best one.
function pickName(
  localized: Record<string, string> | undefined,
  fallback = ''
): string {
  if (!localized) return fallback
  return (
    localized.en ??
    localized['en-US'] ??
    Object.values(localized)[0] ??
    fallback
  )
}

// Friendly labels for the common registered axes.
const AXIS_LABELS: Record<string, string> = {
  wght: 'Weight',
  wdth: 'Width',
  slnt: 'Slant',
  ital: 'Italic',
  opsz: 'Optical Size',
  GRAD: 'Grade',
}

function readFvarAxes(font: opentype.Font): Axis[] {
  // `tables.fvar` is loosely typed (any) in opentype.js.
  const fvar = (font.tables as Record<string, unknown>).fvar as
    | { axes?: Array<{ tag: string; minValue: number; defaultValue: number; maxValue: number; name?: Record<string, string> }> }
    | undefined

  if (!fvar?.axes?.length) return []

  return fvar.axes.map((a) => ({
    tag: a.tag,
    name: AXIS_LABELS[a.tag] ?? pickName(a.name, a.tag),
    min: a.minValue,
    max: a.maxValue,
    default: a.defaultValue,
  }))
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function InspectorPage() {
  const [info, setInfo] = useState<FontInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [values, setValues] = useState<Record<string, number>>({})
  const [previewText, setPreviewText] = useState('Typography')
  const [copied, setCopied] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  // Keep a reference so we can revoke the previous object URL.
  const urlRef = useRef<string | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  /* ----- Parse a dropped/selected file ----------------------------------- */
  const handleFile = useCallback((file: File) => {
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.ttf') && !lower.endsWith('.otf')) {
      setError('Please drop a .ttf or .otf font file.')
      return
    }

    setParsing(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const font = opentype.parse(buffer)

        const axes = readFvarAxes(font)
        const isVariable = axes.length > 0

        // Create an object URL + @font-face so we can actually render it.
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        const blob = new Blob([buffer], {
          type: lower.endsWith('.otf') ? 'font/otf' : 'font/ttf',
        })
        const fontUrl = URL.createObjectURL(blob)
        urlRef.current = fontUrl

        const cssFamily = `inspected-${Date.now()}`

        // Inject an @font-face rule.
        if (!styleRef.current) {
          styleRef.current = document.createElement('style')
          document.head.appendChild(styleRef.current)
        }
        styleRef.current.textContent = `@font-face {
          font-family: '${cssFamily}';
          src: url('${fontUrl}');
          font-weight: 1 1000;
          font-stretch: 1% 1000%;
          font-display: swap;
        }`

        setInfo({
          name: pickName(font.names.fullName) || pickName(font.names.fontFamily) || file.name,
          copyright: pickName(font.names.copyright, '—'),
          glyphCount: font.numGlyphs ?? font.glyphs?.length ?? 0,
          unitsPerEm: font.unitsPerEm,
          isVariable,
          axes,
          cssFamily,
          fontUrl,
        })

        // Seed slider values with each axis default.
        const initial: Record<string, number> = {}
        axes.forEach((a) => (initial[a.tag] = a.default))
        setValues(initial)
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error
            ? `Could not parse font: ${err.message}`
            : 'Could not parse this font file.'
        )
        setInfo(null)
      } finally {
        setParsing(false)
      }
    }
    reader.onerror = () => {
      setError('Failed to read the file.')
      setParsing(false)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  /* ----- Drag & drop handlers -------------------------------------------- */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  /* ----- font-variation-settings CSS string ------------------------------ */
  const fvsString = useMemo(() => {
    if (!info?.isVariable) return ''
    return info.axes
      .map((a) => `"${a.tag}" ${values[a.tag] ?? a.default}`)
      .join(', ')
  }, [info, values])

  const cssBlock = useMemo(() => {
    if (!info) return ''
    if (!info.isVariable) {
      return `font-family: '${info.name}';`
    }
    return `font-variation-settings: ${fvsString};`
  }, [info, fvsString])

  const handleCopy = async () => {
    if (!cssBlock) return
    try {
      await navigator.clipboard.writeText(cssBlock)
    } catch {
      const el = document.createElement('textarea')
      el.value = cssBlock
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetAxes = () => {
    if (!info) return
    const reset: Record<string, number> = {}
    info.axes.forEach((a) => (reset[a.tag] = a.default))
    setValues(reset)
  }

  const clearFont = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    if (styleRef.current) styleRef.current.textContent = ''
    setInfo(null)
    setValues({})
    setError(null)
  }

  /* ----------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <title>Variable Font Inspector — Fontify</title>
      <ToolNav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Dropzone (always visible) */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? 'border-neutral-400 bg-neutral-100 dark:bg-neutral-900'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".ttf,.otf,font/ttf,font/otf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ''
            }}
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-700">
            <UploadCloud className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium">
            {parsing
              ? 'Parsing font…'
              : 'Drop a .ttf or .otf file, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Everything is parsed locally in your browser — nothing is uploaded.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
            {/* ----------------------- Metadata + axes ----------------------- */}
            <aside className="space-y-6">
              {/* Metadata */}
              <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <FileType2 className="h-4 w-4" />
                    Font details
                  </div>
                  <button
                    onClick={clearFont}
                    title="Clear"
                    className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-500">Name</dt>
                    <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
                      {info.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Copyright className="h-3 w-3" /> Copyright
                    </dt>
                    <dd className="mt-0.5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {info.copyright}
                    </dd>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Hash className="h-3 w-3" /> Glyphs
                      </dt>
                      <dd className="mt-0.5 font-mono text-neutral-900 dark:text-neutral-100">
                        {info.glyphCount.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-neutral-500">Units / em</dt>
                      <dd className="mt-0.5 font-mono text-neutral-900 dark:text-neutral-100">
                        {info.unitsPerEm}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        info.isVariable
                          ? 'bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-900/50'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {info.isVariable
                        ? `Variable font · ${info.axes.length} ${
                            info.axes.length === 1 ? 'axis' : 'axes'
                          }`
                        : 'Static font'}
                    </span>
                  </div>
                </dl>
              </section>

              {/* Axis sliders */}
              {info.isVariable && (
                <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Sliders className="h-4 w-4" />
                      Variation axes
                    </div>
                    <button
                      onClick={resetAxes}
                      className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 transition hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  </div>

                  <div className="space-y-5">
                    {info.axes.map((a) => (
                      <div key={a.tag}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <label
                            htmlFor={`axis-${a.tag}`}
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            {a.name}{' '}
                            <span className="font-mono text-xs text-neutral-400 dark:text-neutral-600">
                              {a.tag}
                            </span>
                          </label>
                          <span className="font-mono text-neutral-900 dark:text-neutral-100">
                            {Math.round((values[a.tag] ?? a.default) * 100) / 100}
                          </span>
                        </div>
                        <input
                          id={`axis-${a.tag}`}
                          type="range"
                          min={a.min}
                          max={a.max}
                          step={(a.max - a.min) / 200 || 1}
                          value={values[a.tag] ?? a.default}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [a.tag]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-neutral-900 dark:accent-neutral-100"
                        />
                        <div className="mt-1 flex justify-between font-mono text-[11px] text-neutral-400 dark:text-neutral-600">
                          <span>{a.min}</span>
                          <span>{a.max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            {/* ----------------------- Preview + CSS ------------------------- */}
            <section className="space-y-6">
              {/* Preview text input */}
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type to preview…"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-neutral-600"
              />

              {/* Large live preview */}
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-100/60 dark:from-neutral-900/60 to-white dark:to-neutral-950 p-8">
                <p
                  className="break-words text-center leading-none text-neutral-900 dark:text-neutral-50"
                  style={{
                    fontFamily: `'${info.cssFamily}', sans-serif`,
                    fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                    fontVariationSettings: info.isVariable
                      ? fvsString
                      : undefined,
                  }}
                >
                  {previewText || 'Typography'}
                </p>
              </div>

              {/* CSS output */}
              <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-3">
                  <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {info.isVariable
                      ? 'font-variation-settings'
                      : 'font-family'}
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
                  <code>{cssBlock}</code>
                </pre>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
