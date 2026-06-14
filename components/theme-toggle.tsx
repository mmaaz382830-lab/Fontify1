'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

/**
 * Dark / light mode toggle. Reads & writes `localStorage.theme` and toggles
 * the `dark` class on <html>. The initial class is set by an inline script
 * in the root layout to avoid a flash of the wrong theme.
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      role="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={mounted ? (isDark ? 'Switch to light' : 'Switch to dark') : 'Toggle theme'}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-secondary text-text-secondary transition-colors duration-300 hover:bg-bg-tertiary hover:text-text-primary"
    >
      {/* Rotate-swap on theme change; stable icon until mounted (no hydration mismatch). */}
      {!mounted ? (
        <Moon className="h-4 w-4" />
      ) : (
        <span
          key={isDark ? 'sun' : 'moon'}
          className="inline-flex animate-[spin_0.4s_ease-out] [animation-iteration-count:1]"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </span>
      )}
    </button>
  )
}
