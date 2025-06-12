// src/app/api/save-submission/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Import our new server client

export async function POST(request: Request) {
  const supabase = createClient();

  // First, check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to submit.' }, { status: 401 });
  }

  // Parse the request body
  const { promptId, submissionText, isAnonymous } = await request.json();

  // Validate the incoming data
  if (typeof promptId !== 'number' || typeof submissionText !== 'string' || typeof isAnonymous !== 'boolean') {
    return NextResponse.json({ error: 'Invalid data format.' }, { status: 400 });
  }

  // Prepare the data for insertion
  const submissionData = {
    user_id: user.id, // The user's ID comes from the authenticated session
    prompt_id: promptId,
    submission_text: submissionText,
    is_anonymous: isAnonymous,
  };

  // Insert the data into the 'submissions' table
  const { error } = await supabase.from('submissions').insert(submissionData);

  if (error) {
    console.error('Supabase submission error:', error);
    return NextResponse.json({ error: 'Failed to save submission.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Submission saved successfully!' }, { status: 201 });
}