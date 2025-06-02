// src/components/EmailForm.tsx
"use client";

import React, { useState } from 'react';

interface EmailFormProps {
  promptText?: string;
  submissionText?: string;
}

export default function EmailForm({ promptText, submissionText }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSentMessage, setEmailSentMessage] = useState('');


  const handleSendSubmissionEmail = async (registeredEmail: string) => {
    if (!promptText || submissionText === undefined) { // submissionText can be empty string
      // Not enough data to send submission email, or not in the right context
      return;
    }

    setEmailSentMessage('Sending a copy to your email...');
    try {
      const response = await fetch('/api/send-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: registeredEmail,
          prompt: promptText,
          submissionText: submissionText,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailSentMessage(data.message || 'Copy sent to your email!');
      } else {
        setEmailSentMessage(`Failed to send copy: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Send submission email error:', error);
      setEmailSentMessage('Error sending email copy.');
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);
    setEmailSentMessage('');


    if (!email.trim()) {
      setMessage('Please enter your email address.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    let registeredEmail = email.toLowerCase(); // Use the submitted email for sending

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        let successMsg = data.message || 'Thank you for subscribing!';
        if (response.status === 200 && data.message.includes('already registered')) {
          successMsg = data.message; // Use the specific "already registered" message
        }
        setMessage(successMsg);
        setIsError(false);
        setEmail(''); // Clear input

        // If prompt and submission text are available, try to send the email
        if (promptText && submissionText !== undefined) {
          await handleSendSubmissionEmail(registeredEmail);
        }

      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Subscription submission error:', error);
      setMessage('An unexpected error occurred. Please check your connection and try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-slate-50 to-gray-100 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
        Want a copy & future updates? 🚀
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Enter your email to get this submission and stay in the loop!
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          className="flex-grow w-full sm:w-auto p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          disabled={isLoading}
          aria-label="Email address"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition-opacity w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Get Copy & Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
      {emailSentMessage && (
        <p className="mt-2 text-center text-sm text-blue-600">
          {emailSentMessage}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-4 text-center">
        We value your privacy. No spam, promise!
      </p>
    </div>
  );
}