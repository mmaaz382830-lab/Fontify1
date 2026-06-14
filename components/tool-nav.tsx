'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Ruler,
  Combine,
  ScanText,
  Palette,
} from 'lucide-react'
import ThemeToggle from './theme-toggle'
import UserMenu from './user-menu'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tools/scale', label: 'Type Scale', icon: Ruler },
  { href: '/tools/playground', label: 'UI Playground', icon: Palette },
  { href: '/tools/pairing', label: 'Font Pairing', icon: Combine },
  { href: '/tools/inspector', label: 'Font Inspector', icon: ScanText },
] as const

interface NavUser {
  name: string
  email: string
  avatarUrl?: string
}

/**
 * Shared top navigation — "Midnight Editorial" palette.
 * Client component so it can highlight the active route.
 */
export default function ToolNav({ user }: { user?: NavUser }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-secondary/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-3">
        <Link
          href="/dashboard"
          title="Fontify"
          className="mr-3 flex items-center gap-2.5 text-sm font-semibold tracking-tight text-text-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary font-bold text-accent ring-1 ring-border">
            F
          </span>
          <span className="hidden sm:inline">Fontify</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side: theme toggle + user menu */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <UserMenu
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
            />
          )}
        </div>
      </div>
    </header>
  )
}
