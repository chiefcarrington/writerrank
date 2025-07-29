// src/app/auth/confirm/route.ts
import { type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// GET /auth/confirm?token_hash=<hash>&type=email&next=/
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // allow optional redirect to other page; default to home
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) {
        // verification succeeded, cookie was set; redirect to app
        redirect(next);
      }
  }
  // if missing or invalid token, redirect to a friendly error page
  redirect('/auth-error');
}
