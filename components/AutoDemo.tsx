'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/* The three states the demo cycles through every 2s. */
const STATES = [
  { size: 16, ratio: 'Perfect Fourth', value: '1.333' },
  { size: 20, ratio: 'Major Third', value: '1.250' },
  { size: 14, ratio: 'Golden Ratio', value: '1.618' },
] as const

const SPACING = ['x1', 'x2', 'x3', 'x4']

const MIN = 14
const MAX = 20
const STEP_MS = 2000

export default function AutoDemo() {
  const [stateIndex, setStateIndex] = useState(0)
  const [activeSpacing, setActiveSpacing] = useState(0)
  const [paused, setPaused] = useState(false)

  // Use a ref so the interval callback always reads fresh values without
  // re-creating the interval each tick.
  const tick = useRef(0)

  useEffect(() => {
    if (paused) return

    const id = setInterval(() => {
      tick.current += 1
      setStateIndex((i) => (i + 1) % STATES.length)
      // Highlight cycles across all 4 spacing chips independently.
      setActiveSpacing(tick.current % SPACING.length)
    }, STEP_MS)

    return () => clearInterval(id) // cleanup → no memory leak
  }, [paused])

  const s = STATES[stateIndex]
  // Slider thumb fill % mapped from the 14–20 range.
  const fillPct = ((s.size - MIN) / (MAX - MIN)) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-[900px]"
    >
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="group relative overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-2xl shadow-accent/10 ring-1 ring-white/5 transition-transform duration-500 md:-rotate-1 md:hover:rotate-0"
      >
        {/* ---------- Browser chrome ---------- */}
        <div className="flex items-center gap-2 border-b border-border bg-bg-tertiary px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-4 flex-1">
            <div className="mx-auto w-fit rounded-md bg-bg-primary px-4 py-1 text-xs text-text-muted">
              fontify.dev/tools/scale
            </div>
          </div>
        </div>

        {/* ---------- Status pill (top-right inside mockup) ---------- */}
        <div className="pointer-events-none absolute right-4 top-14 z-20">
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-bg-primary/80 px-2.5 py-1 text-[11px] text-text-secondary backdrop-blur">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                paused ? 'bg-text-muted' : 'animate-pulse bg-success'
              }`}
            />
            {paused ? 'Paused' : 'Auto-playing • Hover to pause'}
          </span>
        </div>

        {/* ---------- Mock tool UI ---------- */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[260px_1fr]">
          {/* Left: controls */}
          <div className="space-y-5 rounded-lg border border-border bg-bg-primary/40 p-4">
            <div className="text-sm font-medium text-text-secondary">
              Controls
            </div>

            {/* Base size slider */}
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-text-muted">Base size</span>
                <span className="font-mono text-text-primary transition-all duration-500">
                  {s.size}px
                </span>
              </div>
              <div className="relative h-1.5 w-full rounded-full bg-bg-tertiary">
                <div
                  className="h-1.5 rounded-full bg-accent transition-all duration-500 ease-out"
                  style={{ width: `${fillPct}%` }}
                />
                {/* thumb */}
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-accent bg-bg-primary shadow transition-all duration-500 ease-out"
                  style={{ left: `${fillPct}%` }}
                />
              </div>
            </div>

            {/* Ratio display */}
            <div>
              <div className="mb-1.5 text-xs text-text-muted">Ratio</div>
              <div className="flex items-center justify-between rounded-md border border-border bg-bg-secondary px-3 py-2 text-xs text-text-primary">
                <span className="transition-all duration-500">{s.ratio}</span>
                <span className="font-mono text-text-muted">{s.value}</span>
              </div>
            </div>

            {/* Spacing chips with travelling highlight */}
            <div>
              <div className="mb-1.5 text-xs text-text-muted">Spacing</div>
              <div className="grid grid-cols-4 gap-2">
                {SPACING.map((chip, i) => {
                  const on = i === activeSpacing
                  return (
                    <span
                      key={chip}
                      className={`rounded-md px-2 py-1 text-center font-mono text-[11px] transition-all duration-500 ${
                        on
                          ? 'bg-accent-subtle text-accent ring-1 ring-accent/40 shadow-[0_0_12px_rgba(245,166,35,0.25)]'
                          : 'bg-bg-tertiary text-text-secondary ring-1 ring-transparent'
                      }`}
                    >
                      {chip}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: live preview text */}
          <div className="space-y-3 rounded-lg border border-border bg-bg-primary/40 p-6">
            <div
              className="font-bold tracking-tight text-text-primary transition-all duration-500 ease-out"
              style={{ fontSize: `${s.size * 2.5}px`, lineHeight: 1.1 }}
            >
              Heading One
            </div>
            <div
              className="font-semibold text-text-primary transition-all duration-500 ease-out"
              style={{ fontSize: `${s.size * 1.875}px`, lineHeight: 1.15 }}
            >
              Heading Two
            </div>
            <div
              className="font-medium text-text-secondary transition-all duration-500 ease-out"
              style={{ fontSize: `${s.size * 1.4}px`, lineHeight: 1.2 }}
            >
              Heading Three
            </div>
            <div
              className="leading-relaxed text-text-secondary transition-all duration-500 ease-out"
              style={{ fontSize: `${s.size}px` }}
            >
              The quick brown fox jumps over the lazy dog. Fluid typography keeps
              every size in perfect proportion across screens.
            </div>
            <div
              className="text-text-muted transition-all duration-500 ease-out"
              style={{ fontSize: `${s.size * 0.85}px` }}
            >
              Small print stays legible too.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
