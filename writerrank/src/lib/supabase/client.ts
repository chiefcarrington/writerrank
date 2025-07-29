import { createBrowserClient } from '@supabase/ssr';

// Singleton client for browser usage. We allow the default cookie/session settings.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
