'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

/* Mask-reveal for each big digit (slides up from behind an overflow box). */
const digitVariants: Variants = {
  hidden: { y: '110%' },
  visible: (i: number) => ({
    y: '0%',
    transition: { duration: 0.8, ease: EASE, delay: i * 0.1 },
  }),
}

/* Staggered fade-up for the text/buttons below the 404. */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const DIGITS: { char: string; tilt: number }[] = [
  { char: '4', tilt: -3 },
  { char: '0', tilt: 2 },
  { char: '4', tilt: -2 },
]

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-primary px-6 py-16 text-text-primary">
      {/* metadata */}
      <title>404 — Page Not Found — Fontify</title>

      {/* Radial amber glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06] blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, #f5a623 0%, rgba(245,166,35,0.4) 35%, transparent 70%)',
        }}
      />
      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 60% 50% at 50% 45%, black, transparent)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 50% at 50% 45%, black, transparent)',
        }}
      />

      {/* ===================== 404 HERO ===================== */}
      <h1
        aria-label="404 — page not found"
        className="relative z-10 flex select-none items-center justify-center leading-[0.8]"
      >
        {DIGITS.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="block overflow-hidden"
            style={{ paddingBottom: '0.08em' }}
          >
            <motion.span
              custom={i}
              variants={digitVariants}
              initial="hidden"
              animate="visible"
              className="inline-block cursor-default bg-gradient-to-b from-accent to-text-primary bg-clip-text font-bold tracking-tighter text-transparent transition-transform duration-300 ease-out text-[140px] sm:text-[200px] md:text-[320px] lg:text-[400px]"
              style={{
                willChange: 'transform',
                filter: 'drop-shadow(0 12px 60px rgba(245,166,35,0.25))',
              }}
              whileHover={{ rotate: d.tilt, color: '#f5a623' }}
            >
              {d.char}
            </motion.span>
          </span>
        ))}
      </h1>

      {/* ===================== TEXT + ACTIONS ===================== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 -mt-2 flex flex-col items-center text-center md:-mt-6"
      >
        {/* Eyebrow */}
        <motion.p
          variants={itemVariants}
          className="text-xs font-medium uppercase tracking-[0.2em] text-accent"
        >
          Error: Type Not Found
        </motion.p>

        {/* Heading */}
        <motion.h2
          variants={itemVariants}
          className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          This page slipped through the{' '}
          <em className="italic text-accent">kerning</em>.
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="mt-3 max-w-md text-base leading-relaxed text-text-secondary"
        >
          The page you are looking for either moved, got deleted, or never
          existed in this typographic universe.
        </motion.p>

        {/* Easter egg code block */}
        <motion.pre
          variants={itemVariants}
          aria-label="Typography easter egg"
          className="mt-6 rounded-lg border border-border bg-bg-secondary/60 px-4 py-3 text-left font-mono text-xs leading-relaxed text-text-muted"
        >
          <code>
            font-family: &apos;NotFound&apos;, sans-serif;{'\n'}
            font-weight: 404;{'\n'}
            font-size: 0px;
          </code>
        </motion.pre>

        {/* Action buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/"
            aria-label="Back to home"
            className="group flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-colors duration-300 hover:bg-accent-hover"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            aria-label="Explore tools"
            className="group flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-primary transition-colors duration-300 hover:border-accent hover:bg-bg-secondary"
          >
            <Sparkles className="h-4 w-4 text-text-secondary transition-colors duration-300 group-hover:text-accent" />
            Explore Tools
          </Link>
        </motion.div>

        {/* Footer detail */}
        <motion.p
          variants={itemVariants}
          className="mt-10 text-xs italic text-text-muted"
        >
          Lost? Head back to typography.
        </motion.p>
      </motion.div>
    </main>
  )
}
