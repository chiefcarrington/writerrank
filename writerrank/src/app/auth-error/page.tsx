// src/app/auth-error/page.tsx
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">
          Something went wrong during the authentication process. Your login link may have expired or been used already.
        </p>
        <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
          Try Again
        </Link>
      </div>
    </div>
  );
}
