import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/login'

  const supabase = await createClient()

  // Handle code exchange (OAuth or magic link)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle different auth types
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Email confirmation - redirect to login with success message
      return NextResponse.redirect(`${origin}/login?message=Email verified successfully! Please sign in.`)
    }
  }

  // Handle token hash (email verification link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'email',
    })

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      return NextResponse.redirect(`${origin}/login?message=Email verified successfully! Please sign in.`)
    }
  }

  // Check if user is already verified (clicking link again)
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email_confirmed_at) {
    return NextResponse.redirect(`${origin}/login?message=Email already verified! Please sign in.`)
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=Unable to verify email. The link may have expired. Please try signing in or request a new verification email.`)
}
