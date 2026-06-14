import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ToolNav from '@/components/tool-nav'
import Footer from '@/components/footer'
import { Ruler, Combine, ScanText, Palette, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Dashboard' }

const CARDS = [
  {
    href: '/tools/scale',
    icon: Ruler,
    title: 'Fluid Type Scale',
    desc: 'Generate responsive clamp() font sizes and export a Tailwind config.',
  },
  {
    href: '/tools/playground',
    icon: Palette,
    title: 'UI Playground',
    desc: 'Test your fonts and scales in real SaaS, Editorial, and Hero layouts.',
  },
  {
    href: '/tools/pairing',
    icon: Combine,
    title: 'Font Pairing Engine',
    desc: 'Explore Google Font combinations and save your favorites.',
  },
  {
    href: '/tools/inspector',
    icon: ScanText,
    title: 'Variable Font Inspector',
    desc: 'Drop a font file to inspect metadata and play with variable axes.',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'there'

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <main className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      {/* Nav with logout moved into the avatar dropdown on the right */}
      <ToolNav
        user={{
          name: displayName,
          email: user.email ?? '',
          avatarUrl,
        }}
      />

      {/* Content */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-12 pb-16">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary text-lg font-medium uppercase text-text-primary">
              {displayName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* 2x2 grid of fully-clickable cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {CARDS.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-border bg-bg-secondary p-6 transition-all duration-300 hover:scale-[1.02] hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-bg-tertiary ring-1 ring-border transition group-hover:bg-accent-subtle group-hover:ring-accent/30">
                <Icon
                  className="h-5 w-5 text-text-secondary transition group-hover:text-accent"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex items-center gap-1.5 text-base font-medium text-text-primary">
                {title}
                <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
