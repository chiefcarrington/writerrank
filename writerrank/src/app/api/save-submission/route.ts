import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  // Get the authenticated user ID from Clerk
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json(
      { error: 'You must be logged in to submit.' },
      { status: 401 },
    );
  }

  // Parse incoming data
  const { promptId, submissionText, isAnonymous } = await req.json();

  // Validate data types
  if (
    typeof promptId !== 'number' ||
    typeof submissionText !== 'string' ||
    typeof isAnonymous !== 'boolean'
  ) {
    return NextResponse.json(
      { error: 'Invalid data format.' },
      { status: 400 },
    );
  }

  // Create a Supabase client for DB operations
  const supabase = createClient();

  // Prepare the submission data, using clerk_id instead of the old user_id
  const slug = randomUUID();
  const submissionData = {
    clerk_id: userId,
    prompt_id: promptId,
    submission_text: submissionText,
    is_anonymous: isAnonymous,
    slug,
  };

  // Insert the submission into the database
  const { error } = await supabase.from('submissions').insert(submissionData);

  if (error) {
    console.error('Supabase submission error:', error);
    return NextResponse.json(
      { error: 'Failed to save submission.' },
      { status: 500 },
    );
  }

  const redirectUrl = new URL('/done', req.url);
  redirectUrl.searchParams.set('slug', slug);
  return NextResponse.redirect(redirectUrl, 303);
}
