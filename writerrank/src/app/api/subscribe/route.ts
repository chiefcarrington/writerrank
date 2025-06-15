// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import * as React from 'react';
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

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export async function POST(request: Request) {
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

    // Step 1: Subscribe the user using upsert
    const { error: subscribeError } = await supabase
      .from('registered_users')
      .upsert(
        { email: email.toLowerCase() },
        { onConflict: 'email' }
      );

    if (subscribeError) {
      console.error('Supabase subscribe error:', subscribeError);
      return NextResponse.json({ error: 'Could not subscribe email due to a database error.' }, { status: 500 });
    }

    // Step 2: Send the submission copy email
    if (promptText && submissionText !== undefined) {
      
      const emailElement = React.createElement(SubmissionEmail, {
        userEmail: email,
        prompt: promptText,
        submissionText: submissionText,
      });

      // VVVVVV THE FIX IS HERE VVVVVV
      // Await the render function to get the string, as required by your environment's types
      const emailHtml = await render(emailElement);
      // ^^^^^ END OF FIX ^^^^^

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