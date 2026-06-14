'use client'

import { MotionConfig } from 'framer-motion'

/**
 * App-wide motion settings.
 * `reducedMotion="user"` makes every Framer Motion component automatically
 * skip transform/opacity animations when the OS-level
 * "prefers reduced motion" setting is on — pairing with the CSS guard in
 * globals.css for full coverage (CSS + JS animations).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
