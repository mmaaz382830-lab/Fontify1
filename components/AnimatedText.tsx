'use client'

import { useRef } from 'react'

interface AnimatedTextProps {
  text: string
  className?: string
  /** Optional className applied to each letter (e.g. gradient text). */
  letterClassName?: string
}

/**
 * Splits a string into individually hoverable letters.
 * On hover, each letter lifts (-4px), tilts (-2deg) and shifts to the accent
 * color. Neighbours of the hovered letter lift slightly less, creating a
 * proximity-based "wave" rather than a flat all-at-once hover.
 *
 * Only `transform` + `color` animate, so it stays GPU-friendly.
 */
export default function AnimatedText({
  text,
  className,
  letterClassName,
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  const words = text.split(' ')

  return (
    <span
      ref={ref}
      className={className}
      // Reset every letter when the cursor leaves the whole headline.
      onMouseLeave={() => {
        ref.current
          ?.querySelectorAll<HTMLElement>('[data-letter]')
          .forEach((el) => {
            el.style.transform = 'translateY(0) rotate(0deg)'
            el.style.color = ''
          })
      }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              data-letter
              className={`inline-block transition-transform duration-200 ease-out ${
                letterClassName ?? ''
              }`}
              style={{ willChange: 'transform' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.transform = 'translateY(-4px) rotate(-2deg)'
                el.style.color = 'var(--color-accent)'
                // Neighbours lift a touch less for a soft falloff.
                const prev = el.previousElementSibling as HTMLElement | null
                const next = el.nextElementSibling as HTMLElement | null
                ;[prev, next].forEach((sib) => {
                  if (sib?.dataset.letter !== undefined) {
                    sib.style.transform = 'translateY(-2px) rotate(-1deg)'
                  }
                })
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.transform = 'translateY(0) rotate(0deg)'
                el.style.color = ''
                const prev = el.previousElementSibling as HTMLElement | null
                const next = el.nextElementSibling as HTMLElement | null
                ;[prev, next].forEach((sib) => {
                  if (sib?.dataset.letter !== undefined) {
                    sib.style.transform = 'translateY(0) rotate(0deg)'
                  }
                })
              }}
            >
              {char}
            </span>
          ))}
          {/* Preserve spaces between words */}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}
