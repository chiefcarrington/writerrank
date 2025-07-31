'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const EmailForm = dynamic(() => import('@/components/EmailForm'), { ssr: false });
const AuthButton = dynamic(() => import('@/components/AuthButton'), { ssr: false });

export default function DonePage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl w-full text-center">
        <div className="mb-4">
          <AuthButton />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Submission Received</h1>
        {slug && (
          <p className="text-gray-600 mb-6">Share or revisit your writing with this link: <span className="font-mono">{slug}</span></p>
        )}
        <Suspense fallback={<div>Loading form...</div>}>
          <EmailForm />
        </Suspense>
      </div>
    </main>
  );
}
