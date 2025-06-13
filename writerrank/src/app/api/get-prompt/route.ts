// src/app/api/get-prompt/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This option ensures that this route is re-evaluated on every request.
// It prevents Next.js from caching a single day's prompt for too long.
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();

  // Get today's date in 'YYYY-MM-DD' format, making sure to use UTC
  // to be consistent with the server's timezone.
  const today = new Date().toISOString().split('T')[0];

  // Fetch the prompt scheduled for today
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('id, prompt_text')
    .eq('date_shown', today)
    .single(); // .single() expects exactly one row, which is perfect for a daily prompt.

  if (error || !prompt) {
    console.error('Error fetching today\'s prompt:', error);
    // You could return a default fallback prompt here if you wanted
    return NextResponse.json(
      { error: 'Could not fetch the prompt for today.' },
      { status: 404 }
    );
  }

  return NextResponse.json(prompt);
}