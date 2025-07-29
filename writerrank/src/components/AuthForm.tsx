'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    // Send a magic link. Do not set emailRedirectTo; your template controls the redirect URL.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // e.g. shouldCreateUser: false, if desired
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
    } else {
      setMessage('Check your email for the magic link!');
      setIsError(false);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Sign In / Register</h2>
      <p>Enter your email to receive a secure magic link. No password needed.</p>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending…' : 'Send Magic Link'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
