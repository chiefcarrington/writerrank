import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Do not run Supabase middleware on auth callback or confirm routes
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm')) {
    return NextResponse.next();
  }

  // Clone the request for downstream handlers, preserving headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Use default cookie names (no custom cookieOptions) to match your client/server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh the user session; if it fails, log error but don’t block request
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error('Middleware auth error:', error);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
