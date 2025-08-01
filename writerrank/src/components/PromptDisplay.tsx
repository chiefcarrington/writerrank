// src/components/PromptDisplay.tsx
import React from 'react';

interface PromptDisplayProps {
  prompt: string | null;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt }) => {
  if (!prompt) return null;

  return (
    <div className="text-center">
      <div className="p-6">
        <p className="text-xl text-[color:var(--ow-neutral-900)] leading-relaxed">{prompt}</p>
      </div>
    </div>
  );
}; 

export default PromptDisplay;
