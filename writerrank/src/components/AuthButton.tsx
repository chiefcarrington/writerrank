// src/components/AuthButton.tsx
'use client';

import { useAuth } from './auth-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import the router from next/navigation

export default function AuthButton() {
  const { user, supabase } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
    // Refresh the page to ensure the user state is updated everywhere
    router.refresh(); 
  };

  // If the user object exists, show their email and a logout button
  if (user) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          Signed in as {user.email}
        </span>
        <button
          onClick={handleLogout}
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