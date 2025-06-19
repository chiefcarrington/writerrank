// src/components/AuthButton.tsx
'use client';

import { useAuth } from './auth-provider';
import Link from 'next/link';

export default function AuthButton() {
  const { user, profile, signOut } = useAuth();

  // If the user object exists, show their info and a logout button
  if (user) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          Welcome, {profile?.username || user.email}
        </span>
        <button
          onClick={signOut}
          className="text-indigo-600 hover:underline focus:outline-none"
        >
          Log Out
        </button>
      </div>
    );
  }

  // If there is no user, show the sign-in link
  return (
    <Link href="/login" className="text-sm text-indigo-600 hover:underline">
      Sign In / Register
    </Link>
  );
}