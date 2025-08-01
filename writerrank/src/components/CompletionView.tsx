// src/components/CompletionView.tsx
import React from 'react';
import EmailForm from './EmailForm';
import { Button } from './ui/button';

interface CompletionViewProps {
  submission: string;
  currentPrompt: string | null;
  onWriteAgain: () => void;
}

const CompletionView: React.FC<CompletionViewProps> = ({
  submission,
  currentPrompt,
  onWriteAgain,
}) => (
  <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md text-center">
    <h2 className="text-3xl font-bold text-[color:var(--ow-orange-500)] mb-4">
      Well Done!
    </h2>

    <p className="text-gray-600 mb-6">
      Here&apos;s what you wrote in 3 minutes:
    </p>

    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md min-h-[150px] text-left whitespace-pre-wrap mb-8">
      {submission || (
        <span className="text-gray-400">
          You didn&apos;t write anything this time.
        </span>
      )}
    </div>

    <div className="my-8 border-t border-gray-200 pt-8">
      <EmailForm
        promptText={currentPrompt === null ? undefined : currentPrompt}
        submissionText={submission}
      />
    </div>

    {/* ⬇⬇ Conflict resolved here: keep orange palette & add rounded-md */}
    <Button
      onClick={onWriteAgain}
      className="px-6 py-2 rounded-md bg-[color:var(--ow-orange-500)] hover:bg-[color:var(--ow-orange-500)]/90 text-white font-semibold"
    >
      Ready for Tomorrow&apos;s Prompt
    </Button>

    <p className="text-sm text-gray-500 mt-2">
      (Or check back after midnight for a new prompt)
    </p>
  </div>
);

export default CompletionView;