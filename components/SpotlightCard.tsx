'use client'

import { useRef } from 'react'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
}

/**
 * Card wrapper with a soft amber spotlight that follows the cursor.
 * Mouse position is written to CSS variables (--mouse-x/--mouse-y) and a
 * radial-gradient overlay reads them — so no React re-render per mouse move.
 * The spotlight overlay only renders on md+ (desktop).
 */
export default function SpotlightCard({
  children,
  className = '',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group/spotlight relative ${className}`}
    >
      {/* Spotlight overlay (desktop only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100 md:block"
        style={{
          background:
            'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(245,166,35,0.06), transparent 40%)',
        }}
      />
      {children}
    </div>
  )
}
