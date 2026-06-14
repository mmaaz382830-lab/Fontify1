'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Ruler,
  Combine,
  ScanText,
  Palette,
  ArrowRight,
} from 'lucide-react'
import AnimatedText from '@/components/AnimatedText'
import MagneticButton from '@/components/MagneticButton'
import SpotlightCard from '@/components/SpotlightCard'
import ScrollReveal, { RevealItem } from '@/components/ScrollReveal'
import MaskReveal from '@/components/MaskReveal'
import CustomCursor from '@/components/CustomCursor'
import AutoDemo from '@/components/AutoDemo'

const FEATURES = [
  {
    href: '/tools/scale',
    icon: Ruler,
    title: 'Fluid Type Scale',
    desc: 'Generate responsive clamp() font sizes and export a production-ready Tailwind config.',
  },
  {
    href: '/tools/pairing',
    icon: Combine,
    title: 'Font Pairing Engine',
    desc: 'Explore curated Google Font combinations and save the pairings you love.',
  },
  {
    href: '/tools/inspector',
    icon: ScanText,
    title: 'Variable Font Inspector',
    desc: 'Drop any font file to inspect metadata and tweak its variable axes live.',
  },
  {
    href: '/tools/playground',
    icon: Palette,
    title: 'UI Playground',
    desc: 'Preview your fonts and scales inside real SaaS, editorial, and hero layouts.',
  },
]

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22v3.29c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      {/* ===================== NAV ===================== */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo with hover spin (ANIMATION 8) */}
          <Link href="/" title="Fontify" className="group flex items-center gap-2.5">
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary font-bold text-text-primary ring-1 ring-border transition-colors duration-300 group-hover:text-accent"
              whileHover={{ rotate: -12 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              F
            </motion.span>
            <span className="text-base font-semibold tracking-tight">Fontify</span>
          </Link>

          {/* Center links with underline-draw (ANIMATION 3) */}
          <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
            <a href="#features" className="link-underline transition-colors duration-300 hover:text-text-primary">
              Features
            </a>
            <a href="#tools" className="link-underline transition-colors duration-300 hover:text-text-primary">
              Tools
            </a>
            <a href="#demo" className="link-underline transition-colors duration-300 hover:text-text-primary">
              Demo
            </a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="link-underline rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-300 hover:text-text-primary"
              >
                Sign In
              </Link>
            </motion.div>
            <MagneticButton
              href="/login"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors duration-300 hover:bg-accent-hover"
            >
              Get Started Free
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="relative flex min-h-[calc(100vh-69px)] items-center justify-center overflow-hidden px-6">
        {/* Custom cursor, scoped to the hero (ANIMATION 9) */}
        <CustomCursor />

        {/* Radial amber glow behind text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, #f5a623 0%, rgba(245,166,35,0.35) 35%, transparent 70%)',
          }}
        />
        {/* Faint grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage:
              'radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl py-20 text-center">
          {/* Eyebrow (fades in after headline) */}
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.2em] text-accent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Typography Toolkit for Modern Teams
          </motion.p>

          {/* Headline: mask reveal on load (ANIMATION 6) + split-letter hover (ANIMATION 1) */}
          <h1 className="mt-6 text-6xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            <MaskReveal
              lines={[
                <AnimatedText key="l1" text="Stop guessing." />,
                <AnimatedText key="l2" text="Start building" />,
                <span key="l3">
                  <AnimatedText
                    text="typography"
                    letterClassName="bg-gradient-to-r from-accent via-amber-200 to-text-primary bg-clip-text text-transparent"
                  />{' '}
                  <AnimatedText text="that scales." />
                </span>,
              ]}
            />
          </h1>

          {/* Subheadline */}
          <motion.p
            className="mx-auto mt-7 max-w-2xl text-xl font-normal leading-relaxed text-text-secondary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Generate fluid type scales, pair fonts with confidence, and inspect
            any typography in seconds. Built for designers and developers who
            care about the details.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton
              href="/login"
              className="group rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-on-accent transition-colors duration-300 hover:bg-accent-hover"
            >
              Start Building Free
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </MagneticButton>
            <motion.a
              href="#demo"
              whileTap={{ scale: 0.97 }}
              className="rounded-lg border border-border px-7 py-3.5 text-base font-medium text-text-primary transition-colors duration-300 hover:border-accent hover:bg-bg-secondary"
            >
              See Live Demo
            </motion.a>
          </motion.div>

          {/* Trust strip */}
          <motion.p
            className="mt-8 text-sm text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            Free forever • No credit card required • Open source
          </motion.p>
        </div>
      </section>

      {/* ===================== VISUAL DEMO ===================== */}
      <section id="demo" className="px-6 pb-28">
        <AutoDemo />
      </section>

      {/* ===================== FEATURE GRID ===================== */}
      <section id="features" className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
            <RevealItem>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Everything you need
              </p>
            </RevealItem>
            <RevealItem>
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Four tools. One typography workflow.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 text-lg text-text-secondary">
                From scale to specimen, Fontify covers the whole pipeline.
              </p>
            </RevealItem>
          </ScrollReveal>

          <ScrollReveal id="tools" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURES.map(({ href, icon: Icon, title, desc }) => (
              <RevealItem key={href}>
                <SpotlightCard className="h-full rounded-2xl">
                  <Link
                    href={href}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-bg-secondary p-6 transition-colors duration-300 hover:border-accent/50"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-bg-tertiary ring-1 ring-border transition-all duration-300 group-hover:bg-accent-subtle group-hover:ring-accent/30">
                      <Icon className="h-5 w-5 text-text-secondary transition-colors duration-300 group-hover:text-accent" strokeWidth={1.75} />
                    </div>
                    <div className="flex items-center gap-1.5 text-lg font-semibold text-text-primary">
                      {title}
                      <ArrowRight className="h-4 w-4 text-text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {desc}
                    </p>
                  </Link>
                </SpotlightCard>
              </RevealItem>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ===================== CTA BANNER ===================== */}
      <section className="px-6 pb-28">
        <ScrollReveal className="mx-auto max-w-5xl">
          <RevealItem>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-secondary px-8 py-16 text-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
                style={{ background: 'radial-gradient(circle, #f5a623, transparent 70%)' }}
              />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Build typography that scales.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-text-secondary">
                  Join designers and developers shipping better type, faster.
                </p>
                <div className="mt-7 flex justify-center">
                  <MagneticButton
                    href="/login"
                    className="group rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-on-accent transition-colors duration-300 hover:bg-accent-hover"
                  >
                    Start Building Free
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </MagneticButton>
                </div>
              </div>
            </div>
          </RevealItem>
        </ScrollReveal>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-tertiary text-xs font-bold text-accent ring-1 ring-border">
              F
            </span>
            <span className="text-sm text-text-secondary">
              Fontify © 2025 — Built for learning by Mohammad Maaz
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors duration-300 hover:border-accent hover:text-text-primary"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors duration-300 hover:border-accent hover:text-text-primary"
            >
              <XIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
