import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // Get the authenticated user ID from Clerk
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json(
      { error: 'You must be logged in to update your profile.' },
      { status: 401 },
    );
  }

  // Parse and validate the username from the request body
  const { username } = (await req.json()) as { username: string };
  const usernameRegex = /^[a-z0-9_]{3,20}$/;

  if (
    !username ||
    typeof username !== 'string' ||
    !usernameRegex.test(username)
  ) {
    return NextResponse.json(
      {
        error:
          'Username must be 3-20 characters long and can only contain lowercase letters, numbers, and underscores.',
      },
      { status: 400 },
    );
  }

  // Create a Supabase client for database access
  const supabase = createClient();

  // Update the username for the current Clerk user
  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('clerk_id', userId);

  if (error) {
    // Handle specific error codes (e.g., duplicate username)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This username is already taken.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to update username.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'Username updated successfully!' });
}
