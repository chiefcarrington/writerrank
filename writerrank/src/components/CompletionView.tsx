// src/components/CompletionView.tsx
import React from 'react';
import EmailForm from './EmailForm'; // <<<<< IMPORT THE EMAIL FORM

interface CompletionViewProps {
  submission: string;
  onWriteAgain: () => void;
}

const CompletionView: React.FC<CompletionViewProps> = ({ submission, onWriteAgain }) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-xl text-center">
      <h2 className="text-3xl font-bold text-green-600 mb-4">Well Done!</h2>
      <p className="text-gray-600 mb-6">Here&apos;s what you wrote in 3 minutes:</p>
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md min-h-[150px] text-left whitespace-pre-wrap mb-8"> {/* Added mb-8 for spacing */}
        {submission || <span className="text-gray-400">You didn&apos;t write anything this time.</span>}
      </div>

      {/* VVVVV ADD THE EMAIL FORM HERE VVVVV */}
      <div className="my-8 border-t border-gray-200 pt-8">
        <EmailForm />
      </div>
      {/* ^^^^^ END OF EMAIL FORM ADDITION ^^^^^ */}

      <button
        onClick={onWriteAgain}
        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Ready for Tomorrow&apos;s Prompt
      </button>
      <p className="text-sm text-gray-500 mt-2">(Or check back after midnight for a new prompt)</p>
    </div>
  );
};

export default CompletionView;