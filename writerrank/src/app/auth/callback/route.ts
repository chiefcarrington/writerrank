// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth-error`)
      }

      if (data.session) {
        console.log('Session created successfully:', data.session.user.email)
        // Successful authentication - redirect to home
        return NextResponse.redirect(`${origin}/`)
      }
    } catch (err) {
      console.error('Exception during code exchange:', err)
      return NextResponse.redirect(`${origin}/auth-error`)
    }
  }

  // If no code or session creation failed
  console.error('No code provided or session creation failed')
  return NextResponse.redirect(`${origin}/auth-error`)
}