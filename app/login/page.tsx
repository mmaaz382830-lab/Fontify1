'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  Lock,
  Zap,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ThemeToggle from '@/components/theme-toggle'

const EASE = [0.16, 1, 0.3, 1] as const

/* Staggered entrance for the whole card. */
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/* Time-of-day greeting (computed on the client to match the visitor's clock). */
function useGreeting() {
  const [greeting, setGreeting] = useState<{
    text: string
    Icon: typeof Sun
  } | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting({ text: 'Good morning', Icon: Sunrise })
    else if (hour >= 12 && hour < 17) setGreeting({ text: 'Good afternoon', Icon: Sun })
    else if (hour >= 17 && hour < 21) setGreeting({ text: 'Good evening', Icon: Sunset })
    else setGreeting({ text: 'Working late?', Icon: Moon })
  }, [])

  return greeting
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Easter egg: 5 rapid clicks on the F logo.
  const [clicks, setClicks] = useState(0)
  const [egg, setEgg] = useState(false)

  const greeting = useGreeting()

  const handleLogoClick = () => {
    setClicks((c) => {
      const next = c + 1
      if (next >= 5) {
        setEgg(true)
        setTimeout(() => setEgg(false), 2600)
        return 0
      }
      return next
    })
    // Reset the streak if they pause.
    window.clearTimeout((handleLogoClick as { _t?: number })._t)
    ;(handleLogoClick as { _t?: number })._t = window.setTimeout(
      () => setClicks(0),
      600
    )
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      // Preserve where the user was trying to go (set by the auth middleware)
      // so the callback can send them back there after sign-in.
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get('redirectTo') || '/dashboard'
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('next', redirectTo)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })

      if (error) throw error
      // On success the browser is redirected to Google.
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
      setLoading(false)
    }
  }

  const greetingText = useMemo(() => {
    if (egg) return 'Hello again, persistent friend'
    return greeting?.text ?? 'Welcome'
  }, [egg, greeting])

  return (
    <main
      role="main"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary px-6 py-10 text-text-primary"
    >
      <title>Sign In — Fontify</title>

      {/* Radial amber glow spotlight behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[100px]"
        style={{
          background:
            'radial-gradient(circle, #f5a623 0%, rgba(245,166,35,0.4) 35%, transparent 70%)',
        }}
      />

      {/* Theme toggle, top-right */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Easter-egg toast */}
      <AnimatePresence>
        {egg && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute left-1/2 top-6 z-30 -translate-x-1/2 rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm font-medium text-text-primary shadow-lg"
            role="status"
          >
            ✨ You found us.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== CARD ===================== */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-bg-secondary p-6 shadow-2xl ring-1 ring-black/5 sm:p-12 dark:ring-white/5"
      >
        {/* Logo with pulsing amber ring */}
        <motion.div variants={item} className="flex justify-center">
          <button
            onClick={handleLogoClick}
            title="Fontify"
            aria-label="Fontify"
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tertiary text-2xl font-bold text-accent ring-1 ring-border transition-transform duration-200 active:scale-95"
          >
            {/* pulse glow */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl ring-2 ring-accent/40"
              style={{ animation: 'pulse-ring 3s ease-out infinite' }}
            />
            F
          </button>
        </motion.div>

        {/* Greeting */}
        <motion.div variants={item} className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            {greeting && (
              <greeting.Icon className="h-5 w-5 text-accent" strokeWidth={2} />
            )}
            <h1 className="text-2xl font-semibold tracking-tight">
              {greetingText}
            </h1>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your workspace to continue with Fontify.
          </p>
        </motion.div>

        {/* Accent divider */}
        <motion.div
          variants={item}
          className="mx-auto my-7 flex items-center justify-center gap-2"
          aria-hidden="true"
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google button */}
        <motion.button
          variants={item}
          onClick={handleGoogleLogin}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          aria-describedby="legal-text"
          className="group flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-bg-primary px-6 py-4 text-base font-medium text-text-primary transition-all duration-200 hover:border-accent hover:bg-accent-subtle hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Connecting…</span>
            </>
          ) : (
            <>
              <GoogleIcon className="h-6 w-6" />
              <span>Continue with Google</span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </>
          )}
        </motion.button>

        {/* Trust strip */}
        <motion.div
          variants={item}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-text-muted"
        >
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> No password
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Instant access
          </span>
        </motion.div>

        {/* Legal */}
        <motion.p
          variants={item}
          id="legal-text"
          className="mt-8 text-center text-xs leading-relaxed text-text-muted"
        >
          By continuing, you agree to our{' '}
          <a
            href="#"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            Terms
          </a>{' '}
          and{' '}
          <a
            href="#"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            Privacy
          </a>
          .
        </motion.p>
      </motion.div>
    </main>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
