// src/components/AuthButton.tsx
'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';

export default function AuthButton() {
  // Get the current Clerk user; this hook is safe to use in client components
  const { user } = useUser();

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Show this section only when signed in */}
      <SignedIn>
        <span className="text-gray-600">
          {/* Display the username if present; fall back to the primary email */}
          Welcome,&nbsp;
          {user?.username ?? user?.primaryEmailAddress?.emailAddress ?? 'User'}
        </span>
        {/* UserButton includes a dropdown with Sign Out and other account options */}
        <UserButton afterSignOutUrl="/" />
      </SignedIn>

      {/* Show this section only when signed out */}
      <SignedOut>
        {/* Use Clerk’s built‑in SignInButton; you can set `mode="modal"` for a popup */}
        <SignInButton mode="modal">
          <button className="text-indigo-600 hover:underline focus:outline-none">
            Sign In / Register
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
