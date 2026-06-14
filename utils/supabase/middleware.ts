import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase auth session on every matched request and
 * keeps auth cookies in sync between the browser and the server.
 *
 * Wire this up from the root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). It refreshes the auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- Route protection ---------------------------------------------------
  // Tools and the dashboard require a signed-in user. If there's no user,
  // bounce to /login and remember where they were trying to go.
  const { pathname } = request.nextUrl
  const isProtected =
    pathname.startsWith('/tools') || pathname.startsWith('/dashboard')

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If a signed-in user hits /login, send them straight to the dashboard.
  if (pathname === '/login' && user) {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/dashboard'
    dashUrl.search = ''
    return NextResponse.redirect(dashUrl)
  }

  return supabaseResponse
}
