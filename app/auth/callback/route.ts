import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * OAuth callback handler.
 *
 * Supabase redirects here with a `?code=...` param after the user
 * authenticates with Google. We exchange that code for a session,
 * which sets the auth cookies via the server client.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // `next` lets you control where the user lands after sign-in.
  // Only allow internal relative paths (avoid open-redirects).
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle load balancers / proxies that set the forwarded host header.
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Something went wrong — send them to an error state on the login page.
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
