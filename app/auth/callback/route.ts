import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/login'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle different auth types
      if (type === 'recovery') {
        // Password recovery - redirect to reset password page
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Email confirmation - redirect to login with success message
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/login?message=Email verified successfully! Please sign in.`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/login?message=Email verified successfully! Please sign in.`)
      } else {
        return NextResponse.redirect(`${origin}/login?message=Email verified successfully! Please sign in.`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Unable to verify email. Please try again or contact support.`)
}
