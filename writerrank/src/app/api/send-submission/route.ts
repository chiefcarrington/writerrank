// src/app/api/send-submission/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import SubmissionEmail from '@/emails/SubmissionEmail'; // Adjust path if your emails folder is elsewhere
import { render } from '@react-email/render'; // To render React component to HTML string

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("CRITICAL: Resend API Key is not defined in environment variables.");
  // throw new Error("Resend API Key is not configured."); // Or handle gracefully
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json(
      { error: 'Email client not initialized due to server configuration error.' },
      { status: 500 }
    );
  }

  try {
    const { userEmail, prompt, submissionText } = await request.json();

    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid recipient email is required.' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt text is required.' }, { status: 400 });
    }
    if (typeof submissionText !== 'string') { // Allow empty submissionText
      return NextResponse.json({ error: 'Submission text is required.' }, { status: 400 });
    }

    // Render the React Email component to an HTML string
    const emailHtml = render(
      <SubmissionEmail
        userEmail={userEmail}
        prompt={prompt}
        submissionText={submissionText}
      />
    );

    const { data, error } = await resend.emails.send({
      from: 'WriterRank <noreply@openwrite.app>', // REPLACE with your verified sending domain on Resend
      to: [userEmail],
      subject: "Here's a copy of your WriterRank Submission!",
      html: emailHtml,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: 'Failed to send email.', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Submission email sent successfully!', resendId: data?.id }, { status: 200 });

  } catch (err: unknown) {
    let errorMessage = 'An unexpected error occurred on the server.';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error('API Route /api/send-submission general error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}