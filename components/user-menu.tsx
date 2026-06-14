'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LogOut, LoaderCircle, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  name: string
  email: string
  avatarUrl?: string
}

/**
 * Avatar button that opens a dropdown containing Logout.
 * Plain React state toggle — no external dropdown library.
 */
export default function UserMenu({ name, email, avatarUrl }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-bg-tertiary py-1 pl-1 pr-2 transition hover:border-border-hover"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-sm font-medium text-text-primary">
            {initial}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-xl"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-text-primary">
              {name}
            </p>
            <p className="truncate text-xs text-text-muted">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-text-secondary transition hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {loading ? 'Signing out…' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  )
}
