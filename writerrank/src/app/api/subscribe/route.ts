// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import * as React from 'react'; // Ensure React is imported
import SubmissionEmail from '@/emails/SubmissionEmail';
import { render } from '@react-email/render';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

// Initialize all our clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const resend = new Resend(process.env.RESEND_API_KEY);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a rate limiter that allows 5 requests per minute from any IP address
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export async function POST(request: Request) {
  // First, apply the rate limiter
  const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
  }

  try {
    const { email, promptText, submissionText } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    // Step 1: Subscribe the user (or confirm they already exist)
    const { error: subscribeError } = await supabase
      .from('registered_users')
      .insert([{ email: email.toLowerCase() }], { onConflict: 'email' });

    if (subscribeError && subscribeError.code !== '23505') {
      console.error('Supabase subscribe error:', subscribeError);
      return NextResponse.json({ error: 'Could not subscribe email.' }, { status: 500 });
    }

    // Step 2: Send the submission copy email
    if (promptText && submissionText !== undefined) {
      
      // VVVVVV MODIFIED BLOCK HERE VVVVVV
      // Create the React element using React.createElement to avoid JSX parsing issues
      const emailElement = React.createElement(SubmissionEmail, {
        userEmail: email,
        prompt: promptText,
        submissionText: submissionText,
      });

      // Render the element to an HTML string
      const emailHtml = render(emailElement);
      // ^^^^^ END OF MODIFICATION ^^^^^

      await resend.emails.send({
        from: 'OpenWrite <noreply@yourverifieddomain.com>', // REPLACE with your verified domain
        to: [email],
        subject: "Here's a copy of your OpenWrite Submission!",
        html: emailHtml,
      });
    }

    return NextResponse.json({ message: 'Thank you! Check your inbox for your submission copy.' }, { status: 200 });

  } catch (err) {
    console.error('API Route /api/subscribe error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}