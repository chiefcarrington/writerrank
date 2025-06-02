// src/app/api/send-submission/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as React from 'react';
import SubmissionEmail from '@/emails/SubmissionEmail';
import { render } from '@react-email/render'; // This is the import we are focusing on

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("CRITICAL: Resend API Key is not defined in environment variables.");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json(
      { error: 'Email client not initialized. Server configuration error: Resend API Key missing.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { userEmail, prompt, submissionText } = body;

    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid recipient email is required.' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt text is required.' }, { status: 400 });
    }
    if (typeof submissionText !== 'string') {
      return NextResponse.json({ error: 'Submission text must be a string.' }, { status: 400 });
    }

    const emailProps = {
      userEmail: userEmail,
      prompt: prompt,
      submissionText: submissionText,
    };

    const emailElement: React.ReactElement = React.createElement(SubmissionEmail, emailProps);
    
    // If TypeScript thinks render() returns Promise<string>, we need to await it.
    // If render() is truly synchronous, await on its result (a string) will resolve immediately.
    // This addresses TypeScript's current understanding of render()'s return type.
    const emailHtml: string = await render(emailElement); // <<<<< MODIFIED HERE

    const { data, error } = await resend.emails.send({
      from: 'OpenWrite <noreply@openwrite.app>', // REPLACE with your verified sending domain
      to: [userEmail],
      subject: "Here's a copy of your WriterRank Submission!",
      html: emailHtml, // Now emailHtml is a string, which Resend likely expects
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: 'Failed to send email.', details: error.message || 'Unknown Resend error' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Submission email sent successfully!', resendId: data?.id }, { status: 200 });

  } catch (err: unknown) {
    let errorMessage = 'An unexpected error occurred on the server.';
    if (err instanceof SyntaxError && err.message.includes("JSON.parse")) {
        errorMessage = "Invalid JSON in request body.";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error('API Route /api/send-submission general error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}