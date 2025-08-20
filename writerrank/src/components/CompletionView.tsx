// src/components/CompletionView.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import EmailForm from './EmailForm';

interface CompletionViewProps {
  submission: string;
  currentPrompt: string | null;
}

const CompletionView: React.FC<CompletionViewProps> = ({ submission, currentPrompt }) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-3xl font-bold text-[color:var(--ow-orange-500)] mb-4">Well Done!</h2>
      <p className="text-gray-600 mb-6">Here&apos;s what you wrote in 3 minutes:</p>
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md min-h-[150px] text-left whitespace-pre-wrap mb-8">
        {submission || <span className="text-gray-400">You didn&apos;t write anything this time.</span>}
      </div>

      <div className="my-8 border-t border-gray-200 pt-8">
        <EmailForm
          promptText={currentPrompt === null ? undefined : currentPrompt}
          submissionText={submission}
        />
      </div>

      {/* Replace donation section with About CTA */}
      <div className="my-8 border-t border-gray-200 pt-8 text-center">
        <h3 className="text-lg font-semibold text-ow-neutral-900 mb-2">
          Want to learn more about OpenWrite?
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Discover our vision, roadmap, and how you can support independent software.
        </p>
        <Link
          href="/about"
          className="inline-block px-6 py-3 bg-ow-orange-500 text-white font-semibold rounded-md hover:bg-ow-orange-500/90 transition-colors"
        >
          Learn About Our Mission
        </Link>
      </div>
    </div>
  );
};

export default CompletionView;
