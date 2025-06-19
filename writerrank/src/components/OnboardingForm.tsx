// src/components/OnboardingForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export default function OnboardingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Username saved! Redirecting...');
      // A full page reload is the most reliable way to force the AuthProvider
      // to re-fetch the session and the newly updated profile.
      // This replaces the router.push and router.refresh combo.
      window.location.href = '/';
    } else {
      setMessage(`Error: ${data.error || 'Something went wrong.'}`);
      setIsLoading(false);
    }
  }, [username, router]);

  return (
    <div className="w-full max-w-sm mx-auto p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome to OpenWrite!</h2>
      <p className="text-center text-gray-600 mb-6">
        Let's set up your public username.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              openwrite.com/u/
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="your_username"
              required
              disabled={isLoading}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
            />
          </div>
           <p className="mt-2 text-xs text-gray-500">
            3-20 characters. Lowercase letters, numbers, and underscores only.
          </p>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Username'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}
