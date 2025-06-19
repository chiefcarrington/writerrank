// src/middleware.ts (Corrected)
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Your existing createClient function is called to get the Supabase client.
  const supabase = createClient()

  // The core logic remains the same: refresh the session and handle the auth code exchange.
  await supabase.auth.getUser()

  // Allow the request to continue.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}