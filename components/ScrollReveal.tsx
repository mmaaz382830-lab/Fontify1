'use client'

import { motion, type Variants } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
}

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  id?: string
}

/**
 * Staggered scroll-reveal container. Wrap children in <RevealItem> to make
 * each one fade + rise in sequence as the group enters the viewport.
 * Triggers once.
 */
export default function ScrollReveal({
  children,
  className,
  id,
}: ScrollRevealProps) {
  return (
    <motion.div
      id={id}
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  )
}

/** A single revealed child. Must be inside <ScrollReveal>. */
export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
