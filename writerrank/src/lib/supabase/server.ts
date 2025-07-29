// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Create a Supabase client for use in Server Components, Route Handlers and Server Actions
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Return all cookies to Supabase
        getAll() {
          return cookieStore.getAll();
        },
        // Write any cookies Supabase wants to set
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // If called in a server component context, ignore (middleware will refresh sessions)
          }
        },
      },
    }
  );
}
