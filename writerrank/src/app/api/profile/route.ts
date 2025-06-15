// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Import our server-side client

export async function POST(request: Request) {
  const supabase = createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to update your profile.' }, { status: 401 });
  }

  // Parse the username from the request body
  const { username } = await request.json();

  // Validate the username
  // This regex matches the constraint we set in the database
  const usernameRegex = /^[a-z0-9_]{3,20}$/;
  if (!username || typeof username !== 'string' || !usernameRegex.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3-20 characters long and can only contain lowercase letters, numbers, and underscores.' },
      { status: 400 }
    );
  }

  // Update the username in the 'profiles' table for the logged-in user
  const { error } = await supabase
    .from('profiles')
    .update({ username: username })
    .eq('id', user.id); // The RLS policy ensures users can only update their own profile

  if (error) {
    console.error('Update username error:', error);
    // Handle specific error for duplicate username
    if (error.code === '23505') { // unique_violation
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update username.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Username updated successfully!' });
}