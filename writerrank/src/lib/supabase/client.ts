// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// By creating the client here in the module scope, we ensure that
// it's a singleton. Any component that imports this file will
// receive the exact same client instance.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
