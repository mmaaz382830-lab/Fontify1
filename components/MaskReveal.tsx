'use client'

import { motion, type Variants } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

interface MaskRevealProps {
  /** Each string is one masked line. */
  lines: React.ReactNode[]
  className?: string
  lineClassName?: string
}

const lineVariants: Variants = {
  hidden: { y: '100%' },
  visible: (i: number) => ({
    y: '0%',
    transition: { duration: 0.8, ease: EASE, delay: i * 0.1 },
  }),
}

/**
 * Headline "curtain" reveal: each line sits inside an overflow-hidden box and
 * slides up from y:100% to y:0 on load, staggered by 0.1s per line.
 * Only transform animates.
 */
export default function MaskReveal({
  lines,
  className,
  lineClassName,
}: MaskRevealProps) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em]">
          <motion.span
            className={`block ${lineClassName ?? ''}`}
            custom={i}
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            style={{ willChange: 'transform' }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
