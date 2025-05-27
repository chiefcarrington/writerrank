// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// These environment variables are crucial.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Defensive check for environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('CRITICAL: Supabase URL or Service Role Key is not defined in environment variables.');
  // Optionally, you could throw an error here to prevent the app from running without proper config
  // throw new Error('Supabase URL or Service Role Key is not defined.');
}

// Initialize Supabase client only if variables are defined
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export async function POST(request: Request) {
  if (!supabase) {
    // This case handles if Supabase client failed to initialize due to missing env vars
    return NextResponse.json(
      { error: 'Database client not initialized due to server configuration error.' },
      { status: 500 }
    );
  }

  try {
    const { email } = await request.json();

    // Basic email validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    // Insert the email into your 'registered_users' table
    // Storing email in lowercase to prevent duplicates and for consistency
    const { data, error } = await supabase
      .from('registered_users') // <<<<< Changed table name here
      .insert([{ email: email.toLowerCase(), created_at: new Date().toISOString() }]) // Add created_at
      .select(); // Optionally select the inserted data

    if (error) {
      console.error('Supabase insert error:', error);
      // Handle specific errors, e.g., unique constraint violation (email already exists)
      // The error code '23505' is for unique_violation in PostgreSQL.
      if (error.code === '23505') {
        return NextResponse.json({ message: 'This email address is already registered!' }, { status: 200 }); // Or 409 status for conflict
      }
      return NextResponse.json({ error: 'Failed to register email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Thank you for registering!', data }, { status: 201 });
  } catch (err: unknown) {
    // Catching unknown and then checking if it's an Error instance
    let errorMessage = 'An unexpected error occurred on the server.';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error('API Route general error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}