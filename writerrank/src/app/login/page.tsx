// src/app/login/page.tsx
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

/**
 * LoginPage renders Clerk’s SignIn component.
 * Clerk’s SignIn page includes the sign‑up option by default, so users can register or sign in from the same page.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <header className="text-center mb-8">
        <Link href="/" className="text-decoration-none">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 cursor-pointer">
            OpenWrite
          </h1>
        </Link>
        <p className="text-gray-500 mt-2">Your daily writing challenge.</p>
      </header>
      {/* Clerk SignIn component renders the entire sign-in/up UI */}
      <SignIn
        appearance={{
          elements: {
            // You can customize form elements here or leave this out for defaults
          },
        }}
      />
    </main>
  );
}
