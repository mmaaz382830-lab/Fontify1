'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface MagneticButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  /** Magnetism strength multiplier (kept subtle by default). */
  strength?: number
}

/**
 * A button that subtly drifts toward the cursor (magnetism) and reveals a
 * soft amber glow that tracks the pointer. Springs back smoothly on leave.
 * Includes a tactile press via whileTap.
 *
 * Only transform/opacity animate. Glow is a radial-gradient overlay.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  className = '',
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50, on: false })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    // Clamp the translation to a max of 8px in any direction.
    const x = Math.max(-8, Math.min(8, relX * strength))
    const y = Math.max(-8, Math.min(8, relY * strength))
    setPos({ x, y })
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      on: true,
    })
  }

  const reset = () => {
    setPos({ x: 0, y: 0 })
    setGlow((g) => ({ ...g, on: false }))
  }

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* Pointer-tracking inner glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glow.on ? 1 : 0,
          background: `radial-gradient(120px circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.25), transparent 60%)`,
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {inner}
      </Link>
    )
  }
  return (
    <button onClick={onClick} className="inline-block">
      {inner}
    </button>
  )
}
