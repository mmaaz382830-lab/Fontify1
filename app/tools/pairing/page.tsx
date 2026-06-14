'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Shuffle,
  Bookmark,
  Trash2,
  Check,
  Search,
  Copy,
  Sun,
  Moon,
} from 'lucide-react'
import ToolNav from '@/components/tool-nav'
import {
  getPairings,
  savePairing,
  deletePairing,
} from './actions'
import type { SavedPairing } from '@/utils/supabase/types'

/* -------------------------------------------------------------------------- */
/*  Types & curated tags                                                       */
/* -------------------------------------------------------------------------- */

type FontCategory =
  | 'sans-serif'
  | 'serif'
  | 'display'
  | 'handwriting'
  | 'monospace'

interface GoogleFont {
  family: string
  category: FontCategory
  variants: string[]
}

/**
 * Curated "vibe" tags. Each maps to the font categories used for the
 * Heading and Body dropdowns, so the picker stays opinionated and useful
 * instead of dumping 1,500 fonts on the user.
 */
interface CuratedTag {
  id: string
  label: string
  description: string
  heading: FontCategory
  body: FontCategory
}

const CURATED_TAGS: CuratedTag[] = [
  {
    id: 'minimalist-saas',
    label: 'Minimalist SaaS',
    description: 'Clean geometric sans for product UIs',
    heading: 'sans-serif',
    body: 'sans-serif',
  },
  {
    id: 'editorial-fintech',
    label: 'Editorial FinTech',
    description: 'Authoritative serif headlines, sans body',
    heading: 'serif',
    body: 'sans-serif',
  },
  {
    id: 'classic-publishing',
    label: 'Classic Publishing',
    description: 'Timeless serif pairing for long-form reading',
    heading: 'serif',
    body: 'serif',
  },
  {
    id: 'bold-startup',
    label: 'Bold Startup',
    description: 'Expressive display titles, neutral sans body',
    heading: 'display',
    body: 'sans-serif',
  },
  {
    id: 'creative-portfolio',
    label: 'Creative Portfolio',
    description: 'Personality-forward handwriting + clean body',
    heading: 'handwriting',
    body: 'sans-serif',
  },
  {
    id: 'developer-docs',
    label: 'Developer Docs',
    description: 'Monospace headings with a readable sans body',
    heading: 'monospace',
    body: 'sans-serif',
  },
]

/* -------------------------------------------------------------------------- */
/*  Fallback font lists (used when no API key / fetch fails)                   */
/* -------------------------------------------------------------------------- */

const FALLBACK_FONTS: GoogleFont[] = [
  // sans-serif
  ...['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Work Sans', 'DM Sans', 'Manrope', 'Nunito Sans'].map(
    (family) => ({ family, category: 'sans-serif' as const, variants: ['regular', '700'] })
  ),
  // serif
  ...['Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Source Serif 4', 'Cormorant Garamond', 'Libre Baskerville'].map(
    (family) => ({ family, category: 'serif' as const, variants: ['regular', '700'] })
  ),
  // display
  ...['Bebas Neue', 'Anton', 'Archivo Black', 'Oswald', 'Righteous', 'Abril Fatface'].map(
    (family) => ({ family, category: 'display' as const, variants: ['regular'] })
  ),
  // handwriting
  ...['Caveat', 'Pacifico', 'Dancing Script', 'Satisfy', 'Kalam'].map(
    (family) => ({ family, category: 'handwriting' as const, variants: ['regular'] })
  ),
  // monospace
  ...['JetBrains Mono', 'Fira Code', 'IBM Plex Mono', 'Source Code Pro', 'Space Mono'].map(
    (family) => ({ family, category: 'monospace' as const, variants: ['regular', '700'] })
  ),
]

/* -------------------------------------------------------------------------- */
/*  Font fetching                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetches the Google Fonts list (sorted by popularity).
 * Falls back to a curated offline list when the API key is missing
 * or the request fails — so the tool always works.
 */
async function fetchGoogleFonts(): Promise<{
  fonts: GoogleFont[]
  usedFallback: boolean
}> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_FONTS_KEY

  if (!key) {
    return { fonts: FALLBACK_FONTS, usedFallback: true }
  }

  const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${key}&sort=popularity`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Google Fonts API error (${res.status})`)
  }

  const data = (await res.json()) as {
    items: { family: string; category: FontCategory; variants: string[] }[]
  }

  const fonts: GoogleFont[] = data.items.map((f) => ({
    family: f.family,
    category: f.category,
    variants: f.variants,
  }))

  return { fonts, usedFallback: false }
}

/* -------------------------------------------------------------------------- */
/*  Dynamic <link> injection                                                   */
/* -------------------------------------------------------------------------- */

function fontHref(family: string) {
  const fam = family.trim().replace(/\s+/g, '+')
  // Request a few weights so headings can render bold.
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@400;500;600;700&display=swap`
}

/** Injects (or reuses) a Google Fonts stylesheet <link> in <head>. */
function useGoogleFontLink(family: string | null) {
  useEffect(() => {
    if (!family) return
    const id = `gf-${family.replace(/\s+/g, '-').toLowerCase()}`
    if (document.getElementById(id)) return

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = fontHref(family)
    document.head.appendChild(link)
    // Intentionally not removing on unmount: keeps fonts cached if the
    // user flips back and forth between selections.
  }, [family])
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PairingPage() {
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)

  const [activeTag, setActiveTag] = useState<CuratedTag>(CURATED_TAGS[0])
  const [headingFont, setHeadingFont] = useState<string>('')
  const [bodyFont, setBodyFont] = useState<string>('')
  const [headingWeight, setHeadingWeight] = useState(700)
  const [bodyWeight, setBodyWeight] = useState(400)

  // Live search across all fonts (ignores tag category when set)
  const [headingSearch, setHeadingSearch] = useState('')
  const [bodySearch, setBodySearch] = useState('')

  // Preview theme + CSS export
  const [previewLight, setPreviewLight] = useState(false)
  const [copied, setCopied] = useState(false)

  // Saved pairings (Supabase)
  const [saved, setSaved] = useState<SavedPairing[]>([])
  const [savedLoading, setSavedLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  /* ----- Load fonts ------------------------------------------------------ */
  const loadFonts = async () => {
    setLoading(true)
    setError(null)
    try {
      const { fonts, usedFallback } = await fetchGoogleFonts()
      setAllFonts(fonts)
      setUsedFallback(usedFallback)
    } catch (e) {
      // Last-resort fallback so the UI never dead-ends.
      setAllFonts(FALLBACK_FONTS)
      setUsedFallback(true)
      setError(e instanceof Error ? e.message : 'Failed to load fonts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFonts()
  }, [])

  /* ----- Saved pairings -------------------------------------------------- */
  const loadSaved = async () => {
    setSavedLoading(true)
    const rows = await getPairings()
    setSaved(rows)
    setSavedLoading(false)
  }

  useEffect(() => {
    loadSaved()
  }, [])

  const handleSavePairing = async () => {
    if (!headingFont || !bodyFont) return
    setSaving(true)
    const res = await savePairing({
      tag: activeTag.label,
      heading_font: headingFont,
      body_font: bodyFont,
    })
    setSaving(false)
    if (res.ok) {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
      loadSaved()
    }
  }

  const handleDeletePairing = async (id: string) => {
    // Optimistic removal
    setSaved((prev) => prev.filter((p) => p.id !== id))
    await deletePairing(id)
  }

  const applyPairing = (p: SavedPairing) => {
    const tag = CURATED_TAGS.find((t) => t.label === p.tag)
    if (tag) setActiveTag(tag)
    setHeadingFont(p.heading_font)
    setBodyFont(p.body_font)
  }

  /* ----- Filtered lists per active tag + live search --------------------- */
  // When a search term is present, search across ALL fonts (any category);
  // otherwise show the tag's curated category.
  const headingOptions = useMemo(() => {
    const q = headingSearch.trim().toLowerCase()
    const source = q
      ? allFonts.filter((f) => f.family.toLowerCase().includes(q))
      : allFonts.filter((f) => f.category === activeTag.heading)
    return source.slice(0, 60)
  }, [allFonts, activeTag, headingSearch])

  const bodyOptions = useMemo(() => {
    const q = bodySearch.trim().toLowerCase()
    const source = q
      ? allFonts.filter((f) => f.family.toLowerCase().includes(q))
      : allFonts.filter((f) => f.category === activeTag.body)
    return source.slice(0, 60)
  }, [allFonts, activeTag, bodySearch])

  /* ----- Default/auto selection when tag or data changes ----------------- */
  useEffect(() => {
    // Only fall back to the first option if the current selection isn't
    // valid for the active category. Computed against the tag category
    // (not the search results) so typing in search doesn't hijack the
    // current selection. This also lets applyPairing() set a font + tag
    // together without this effect clobbering it.
    const hCat = allFonts.filter((f) => f.category === activeTag.heading)
    const bCat = allFonts.filter((f) => f.category === activeTag.body)
    if (hCat.length && !hCat.some((f) => f.family === headingFont)) {
      setHeadingFont(hCat[0].family)
    }
    if (bCat.length && !bCat.some((f) => f.family === bodyFont)) {
      setBodyFont(bCat[0].family)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFonts, activeTag])

  /* ----- Inject selected fonts ------------------------------------------- */
  useGoogleFontLink(headingFont || null)
  useGoogleFontLink(bodyFont || null)

  const shuffle = () => {
    if (headingOptions.length)
      setHeadingFont(
        headingOptions[Math.floor(Math.random() * headingOptions.length)].family
      )
    if (bodyOptions.length)
      setBodyFont(
        bodyOptions[Math.floor(Math.random() * bodyOptions.length)].family
      )
  }

  /* ----- CSS export ------------------------------------------------------ */
  const cssExport = useMemo(() => {
    if (!headingFont || !bodyFont) return ''
    const hParam = headingFont.trim().replace(/\s+/g, '+')
    const bParam = bodyFont.trim().replace(/\s+/g, '+')
    return `/* ${headingFont} × ${bodyFont} — ${activeTag.label} */
@import url('https://fonts.googleapis.com/css2?family=${hParam}:wght@400;500;600;700&family=${bParam}:wght@400;500;600;700&display=swap');

:root {
  --font-heading: '${headingFont}', sans-serif;
  --font-body: '${bodyFont}', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: ${headingWeight};
}

body, p {
  font-family: var(--font-body);
  font-weight: ${bodyWeight};
}`
  }, [headingFont, bodyFont, headingWeight, bodyWeight, activeTag])

  const handleCopyCss = async () => {
    if (!cssExport) return
    try {
      await navigator.clipboard.writeText(cssExport)
    } catch {
      const el = document.createElement('textarea')
      el.value = cssExport
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ----------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <title>Font Pairing Engine — Fontify</title>
      <ToolNav />
      {usedFallback && !loading && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <span className="inline-block rounded-full border border-amber-900/50 bg-amber-950/40 px-2.5 py-1 text-[11px] text-amber-300">
            Offline preset list (no API key)
          </span>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
        {/* ----------------------------- Controls --------------------------- */}
        <aside className="space-y-6">
          {/* Tag filter */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Sparkles className="h-4 w-4" />
              Style
            </div>
            <div className="flex flex-wrap gap-2">
              {CURATED_TAGS.map((tag) => {
                const active = tag.id === activeTag.id
                return (
                  <button
                    key={tag.id}
                    onClick={() => setActiveTag(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'bg-white text-neutral-900'
                        : 'border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 hover:border-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              {activeTag.description}
            </p>
          </section>

          {/* Font dropdowns */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500 dark:text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading fonts…
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2.5 text-xs text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {error} — showing a curated offline list instead.
                    </span>
                  </div>
                )}

                {/* Heading font */}
                <div className="mb-5">
                  <label
                    htmlFor="heading-font"
                    className="mb-2 block text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    Heading font{' '}
                    <span className="text-neutral-400 dark:text-neutral-600">
                      ({headingSearch.trim() ? 'all fonts' : activeTag.heading})
                    </span>
                  </label>
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-600" />
                    <input
                      type="text"
                      value={headingSearch}
                      onChange={(e) => setHeadingSearch(e.target.value)}
                      placeholder="Search all fonts…"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-neutral-600"
                    />
                  </div>
                  <select
                    id="heading-font"
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-600"
                  >
                    {headingOptions.length === 0 && (
                      <option disabled>No matches</option>
                    )}
                    {headingOptions.map((f) => (
                      <option key={f.family} value={f.family}>
                        {f.family}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <label htmlFor="heading-weight" className="text-neutral-500">
                      Weight
                    </label>
                    <select
                      id="heading-weight"
                      value={headingWeight}
                      onChange={(e) => setHeadingWeight(Number(e.target.value))}
                      className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:border-neutral-600"
                    >
                      {[400, 500, 600, 700].map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Body font */}
                <div className="mb-5">
                  <label
                    htmlFor="body-font"
                    className="mb-2 block text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    Body font{' '}
                    <span className="text-neutral-400 dark:text-neutral-600">
                      ({bodySearch.trim() ? 'all fonts' : activeTag.body})
                    </span>
                  </label>
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-600" />
                    <input
                      type="text"
                      value={bodySearch}
                      onChange={(e) => setBodySearch(e.target.value)}
                      placeholder="Search all fonts…"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-neutral-600"
                    />
                  </div>
                  <select
                    id="body-font"
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-600"
                  >
                    {bodyOptions.length === 0 && (
                      <option disabled>No matches</option>
                    )}
                    {bodyOptions.map((f) => (
                      <option key={f.family} value={f.family}>
                        {f.family}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <label htmlFor="body-weight" className="text-neutral-500">
                      Weight
                    </label>
                    <select
                      id="body-weight"
                      value={bodyWeight}
                      onChange={(e) => setBodyWeight(Number(e.target.value))}
                      className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:border-neutral-600"
                    >
                      {[400, 500, 600, 700].map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={shuffle}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 transition hover:border-neutral-600"
                  >
                    <Shuffle className="h-4 w-4" />
                    Shuffle
                  </button>
                  <button
                    onClick={loadFonts}
                    title="Reload fonts"
                    className="flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-neutral-500 dark:text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleSavePairing}
                  disabled={saving || !headingFont || !bodyFont}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-white px-3 py-2.5 text-sm font-medium text-white dark:text-neutral-900 transition hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : justSaved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {justSaved ? 'Saved!' : 'Save pairing'}
                </button>
              </>
            )}
          </section>

          {/* Saved pairings */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Bookmark className="h-4 w-4" />
              Saved pairings
            </div>

            {savedLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </div>
            ) : saved.length === 0 ? (
              <p className="py-4 text-xs leading-relaxed text-neutral-500">
                No saved pairings yet. Sign in and hit{' '}
                <span className="text-neutral-700 dark:text-neutral-300">Save pairing</span> to keep
                your favorites here.
              </p>
            ) : (
              <ul className="space-y-2">
                {saved.map((p) => (
                  <li
                    key={p.id}
                    className="group flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2"
                  >
                    <button
                      onClick={() => applyPairing(p)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {p.heading_font}{' '}
                        <span className="text-neutral-400 dark:text-neutral-600">×</span>{' '}
                        {p.body_font}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500">
                        {p.tag}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeletePairing(p.id)}
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
          <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-100/60 dark:from-neutral-900/60 to-white dark:to-neutral-950 p-8 sm:p-12">
            {/* Theme toggle */}
            <div className="mx-auto mb-6 flex max-w-xl items-center justify-end">
              <button
                onClick={() => setPreviewLight((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 transition hover:border-neutral-600"
              >
                {previewLight ? (
                  <>
                    <Moon className="h-3.5 w-3.5" /> Dark preview
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5" /> Light preview
                  </>
                )}
              </button>
            </div>

            {/* The preview card */}
            <article
              className={`mx-auto max-w-xl rounded-2xl border p-8 shadow-2xl shadow-black/40 ${
                previewLight
                  ? 'border-neutral-200 bg-white'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/70'
              }`}
            >
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs ${
                  previewLight
                    ? 'bg-neutral-100 text-neutral-400 dark:text-neutral-600'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
                style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: bodyWeight }}
              >
                {activeTag.label}
              </span>

              <h1
                className={`mt-5 text-4xl leading-tight tracking-tight sm:text-5xl ${
                  previewLight ? 'text-neutral-900' : 'text-neutral-900 dark:text-neutral-50'
                }`}
                style={{
                  fontFamily: `'${headingFont}', serif`,
                  fontWeight: headingWeight,
                }}
              >
                The art of pairing type with intention.
              </h1>

              <p
                className={`mt-5 text-base leading-relaxed ${
                  previewLight ? 'text-neutral-400 dark:text-neutral-600' : 'text-neutral-700 dark:text-neutral-300'
                }`}
                style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: bodyWeight }}
              >
                Good typography is invisible. It guides the reader through a
                hierarchy of ideas without ever calling attention to itself.
                When the heading and body voices complement each other, the
                content simply feels right — trustworthy, legible, and modern.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    previewLight
                      ? 'bg-neutral-100 dark:bg-neutral-900 text-white'
                      : 'bg-white text-neutral-900'
                  }`}
                  style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: bodyWeight }}
                >
                  Get started
                </button>
                <button
                  className={`text-sm ${
                    previewLight ? 'text-neutral-500' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                  style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: bodyWeight }}
                >
                  Learn more →
                </button>
              </div>
            </article>

            {/* Pairing label */}
            <div className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 text-center font-mono text-xs text-neutral-500">
              <span className="text-neutral-700 dark:text-neutral-300">{headingFont || '—'}</span>
              <span>×</span>
              <span className="text-neutral-700 dark:text-neutral-300">{bodyFont || '—'}</span>
            </div>
          </div>

          {/* CSS export */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-3">
              <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                pairing.css
              </span>
              <button
                onClick={handleCopyCss}
                className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 transition hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy CSS'}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              <code>{cssExport || '/* Select fonts to generate CSS */'}</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}
