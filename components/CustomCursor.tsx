'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Premium dual-element cursor, scoped to one section (the hero).
 * - An 8px dot tracks the pointer exactly (rAF, no lag).
 * - A 32px ring follows with a slight CSS transition lag.
 * - Over interactive elements the ring scales up and fades.
 * The native cursor is hidden only while inside the host section.
 *
 * Render this INSIDE the section you want it active in; pass nothing else.
 * Disabled on touch / coarse pointers.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only on devices with a fine pointer (mouse), and skip entirely when the
    // user prefers reduced motion (keeps the native cursor + no lag effect).
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnabled(true)

    const parent = dotRef.current?.parentElement
    if (!parent) return

    let raf = 0
    let x = 0
    let y = 0

    const move = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      x = e.clientX - rect.left
      y = e.clientY - rect.top
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (dotRef.current)
          dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
        if (ringRef.current)
          ringRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${
            hovering ? 1.5 : 1
          })`
      })
    }

    const enter = () => setVisible(true)
    const leave = () => setVisible(false)

    // Detect hovering over interactive elements within the section.
    const over = (e: Event) => {
      const t = e.target as HTMLElement
      setHovering(Boolean(t.closest('a, button, [data-letter], [role="button"]')))
    }

    parent.addEventListener('mousemove', move)
    parent.addEventListener('mouseenter', enter)
    parent.addEventListener('mouseleave', leave)
    parent.addEventListener('mouseover', over)
    parent.classList.add('hero-cursor-none')

    return () => {
      cancelAnimationFrame(raf)
      parent.removeEventListener('mousemove', move)
      parent.removeEventListener('mouseenter', enter)
      parent.removeEventListener('mouseleave', leave)
      parent.removeEventListener('mouseover', over)
      parent.classList.remove('hero-cursor-none')
    }
  }, [hovering])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-50 h-2 w-2 rounded-full bg-accent"
        style={{ opacity: visible ? 1 : 0, willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-50 h-8 w-8 rounded-full border border-accent transition-[transform,opacity] duration-200 ease-out"
        style={{
          opacity: visible ? (hovering ? 0.4 : 0.8) : 0,
          willChange: 'transform',
        }}
      />
    </>
  )
}
