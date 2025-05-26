// src/components/PromptDisplay.tsx
import React from 'react';

interface PromptDisplayProps {
  prompt: string | null;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt }) => {
  if (!prompt) return null;

  return (
    <div className="my-6 p-4 bg-indigo-100 border-l-4 border-indigo-500 rounded-md shadow-sm">
      <p className="text-lg font-semibold text-indigo-700">Today's Prompt:</p>
      <p className="mt-1 text-gray-700">{prompt}</p>
    </div>
  );
};

export default PromptDisplay;