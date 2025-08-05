// src/components/CompletionView.tsx
"use client";

import React, { useState } from 'react';
import EmailForm from './EmailForm';
import DonationWidget from './DonationWidget';

interface CompletionViewProps {
  submission: string;
  currentPrompt: string | null;
  onWriteAgain: () => void;
}

const CompletionView: React.FC<CompletionViewProps> = ({ submission, currentPrompt, onWriteAgain }) => {
  const [showDonation, setShowDonation] = useState(true);
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

      {showDonation && (
        <div className="my-8 border-t border-gray-200 pt-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-[color:var(--ow-neutral-900)] mb-2">
              Love OpenWrite? ❤️
            </h3>
            <p className="text-gray-600 text-sm">
              Support our daily writing challenges with a tip!
            </p>
          </div>
          <DonationWidget />
          <button
            type="button"
            onClick={() => setShowDonation(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Not now
          </button>
        </div>
      )}

      <button
        onClick={onWriteAgain}
        className="px-6 py-2 bg-[color:var(--ow-orange-500)] text-white font-semibold rounded-md hover:bg-[color:var(--ow-orange-500)]/90"
      >
        Ready for Tomorrow&apos;s Prompt
      </button>
      <p className="text-sm text-gray-500 mt-2">(Or check back after midnight for a new prompt)</p>
    </div>
  );
};

export default CompletionView;
