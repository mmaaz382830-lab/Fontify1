'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LogOut, LoaderCircle } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // Refresh server components and send the user back to login.
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{loading ? 'Signing out…' : 'Logout'}</span>
    </button>
  )
}
