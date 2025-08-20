'use client';

// This page relies on runtime-only data (search params) so disable static
// generation to prevent build errors when env vars are missing.
export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import Link from 'next/link';

const EmailForm = dynamicImport(() => import('@/components/EmailForm'), { ssr: false });

export default function DonePage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-ow-orange-50 text-ow-neutral-900">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Submission Received</h1>
        {slug && (
          <p className="text-gray-600 mb-6">Share or revisit your writing with this link: <span className="font-mono">{slug}</span></p>
        )}
        <Suspense fallback={<div>Loading form...</div>}>
          <EmailForm />
          {/* Add after EmailForm component */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-3">
              Curious about what's coming next for OpenWrite?
            </p>
            <Link
              href="/about"
              className="text-ow-orange-500 hover:underline font-medium transition-colors"
            >
              Read our story and roadmap →
            </Link>
          </div>
        </Suspense>
      </div>
    </main>
  );
}
