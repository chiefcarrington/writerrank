import { useState, useRef } from 'react';
import { Timer } from './Timer';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface WritingAreaProps {
  prompt: string;
}

export function WritingArea({ prompt }: WritingAreaProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStart = () => {
    setIsWriting(true);
    // Focus the textarea when starting
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setIsWriting(false);
    // Here you would typically send the content to your backend
    console.log('Submitted content:', content);
  };

  const handleTimeUp = () => {
    setIsWriting(false);
    setIsSubmitted(true);
    // Auto-submit when time is up
    console.log('Time up! Auto-submitted content:', content);
  };

  const getButtonText = () => {
    if (isSubmitted) return 'SUBMITTED';
    if (isWriting) return 'SUBMIT';
    return 'START';
  };

  const getButtonAction = () => {
    if (isSubmitted) return undefined;
    if (isWriting) return handleSubmit;
    return handleStart;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Daily Prompt */}
      <div className="text-center">
        <div className="p-6">
          <p className="text-xl text-[color:var(--ow-neutral-900)] leading-relaxed">
            {prompt}
          </p>
        </div>
      </div>

      {/* Writing Area with Bottom Toolbar */}
      <div className="relative">
        <div className="rounded-lg overflow-hidden shadow-inner">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isWriting ? "Start writing..." : "Click START to begin your 3-minute writing challenge"}
            className="min-h-[320px] border-none text-[color:var(--ow-neutral-900)] text-base leading-relaxed resize-none rounded-none shadow-inner bg-white/60 backdrop-blur-sm"
            disabled={!isWriting || isSubmitted}
            style={{
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
            }}
          />
          
          {/* Bottom Toolbar */}
          <div className="bg-[color:var(--ow-neutral-900)] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Future tools can go here */}
              <div className="text-sm text-[color:var(--ow-neutral-50)]/80">
                {content.length} characters
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isWriting && (
                <Timer isActive={isWriting} onTimeUp={handleTimeUp} />
              )}
              <Button
                onClick={getButtonAction()}
                disabled={isSubmitted}
                className="bg-[color:var(--ow-orange-500)] hover:bg-[color:var(--ow-orange-500)]/90 text-white px-6 shadow-lg"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {isSubmitted && (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Great work! Your writing has been submitted. Come back tomorrow for a new challenge!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}