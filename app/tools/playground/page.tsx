import ToolNav from '@/components/tool-nav'
import Footer from '@/components/footer'
import { Palette, Construction } from 'lucide-react'

export const metadata = { title: 'UI Playground' }

export default function PlaygroundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <ToolNav />

      <section className="mx-auto w-full max-w-6xl px-6 pt-12 pb-16">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-200 ring-1 ring-neutral-300 dark:bg-neutral-800 dark:ring-neutral-700">
            <Palette className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              UI Playground
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Test your fonts and scales in real SaaS, Editorial, and Hero
              layouts.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-20 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
          <Construction className="h-8 w-8 text-neutral-400" />
          <p className="mt-3 text-sm font-medium">Coming soon</p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            This is where you&apos;ll preview your chosen fonts and type scale
            inside realistic layout templates.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
