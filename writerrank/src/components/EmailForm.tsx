// src/components/EmailForm.tsx
"use client";

import React, { useState } from 'react';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    if (!email.trim()) {
      setMessage('Please enter your email address.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle cases where API returns 200 for already subscribed but with a message
        if (response.status === 200 && data.message.includes('already registered')) {
            setMessage(data.message);
            setIsError(false); // Not an error, but informative
        } else {
            setMessage(data.message || 'Thank you for subscribing!');
            setIsError(false);
        }
        setEmail(''); // Clear input after successful submission or accepted "already registered"
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
        Join the Waitlist! 🚀
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Be the first to know when we launch new features and updates.
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
          {isLoading ? 'Submitting...' : 'Notify Me'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-4 text-center">
        We value your privacy. No spam, promise!
        {/* Consider adding a link to your Privacy Policy when you have one */}
      </p>
    </div>
  );
}