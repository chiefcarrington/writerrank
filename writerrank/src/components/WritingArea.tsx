// src/components/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

// The onTimeUp function will now also pass the anonymity setting
interface WritingAreaProps {
  isWritingActive: boolean;
  onStartWriting: () => void;
  onTimeUp: (finalText: string, isAnonymous: boolean) => void;
  initialText?: string;
  onTextChange: (text: string) => void;
  locked: boolean;
}

const WRITING_DURATION_SECONDS = 3 * 60; // 3 minutes

const WritingArea: React.FC<WritingAreaProps> = ({
  isWritingActive,
  onStartWriting,
  onTimeUp,
  initialText = "",
  onTextChange,
  locked,
}) => {
  const [text, setText] = useState(initialText);
  const [timeLeft, setTimeLeft] = useState(WRITING_DURATION_SECONDS);
  const [isAnonymous, setIsAnonymous] = useState(false); // State for the checkbox
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // refs to keep stable references inside the timer interval
  const onTimeUpRef = useRef(onTimeUp);
  const isAnonymousRef = useRef(isAnonymous);

  const currentTextRef = useRef(text);
  useEffect(() => {
    currentTextRef.current = text;
  }, [text]);

  // keep callback and anonymity status refs updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    isAnonymousRef.current = isAnonymous;
  }, [isAnonymous]);

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = WRITING_DURATION_SECONDS - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        onTimeUpRef.current(currentTextRef.current, isAnonymousRef.current);
        return;
      } else {
        setTimeLeft(Math.ceil(remaining));
        rafRef.current = requestAnimationFrame(update);
      }
    };

    if (isWritingActive) {
      setTimeLeft(WRITING_DURATION_SECONDS);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = Date.now();
      rafRef.current = requestAnimationFrame(update);
    } else {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isWritingActive]);

  useEffect(() => {
    onTextChange(text);
  }, [text, onTextChange]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!locked && isWritingActive) {
      setText(event.target.value);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 30) return 'text-red-500';
    if (timeLeft <= 60) return 'text-ow-orange-500';
    return 'text-ow-neutral-50';
  };

  const handleManualSubmit = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    onTimeUp(currentTextRef.current, isAnonymous); // Pass anonymity state
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={handleTextChange}
        placeholder={
          isWritingActive
            ? 'Start writing...'
            : 'Click START to begin your 3-minute writing challenge'
        }
        disabled={locked || !isWritingActive}
        className="min-h-[320px] w-full border border-gray-300 resize-none p-4 rounded-md shadow-inner focus:ring-ow-orange-500 focus:border-ow-orange-500 text-base"
        aria-label="Writing input"
      />

      <div className="bg-ow-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-ow-neutral-50/80">
          {isWritingActive && (
            <label htmlFor="anonymous-checkbox" className="flex items-center cursor-pointer">
              <input
                id="anonymous-checkbox"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-ow-orange-500 focus:ring-ow-orange-500"
              />
              <span className="ml-2">Post anonymously</span>
            </label>
          )}
          <span>{text.length} characters</span>
        </div>

        <div className="flex items-center gap-4">
          {isWritingActive && (
            <span className={`font-mono text-lg ${getTimerColor()}`}>{formatTime(timeLeft)}</span>
          )}
          {!isWritingActive && !locked && (
            <button
              onClick={() => {
                setText('');
                onStartWriting();
              }}
              className="px-6 py-2 bg-ow-orange-500 text-white font-semibold rounded-md hover:bg-ow-orange-500/90"
            >
              Start
            </button>
          )}
          {isWritingActive && (
            <button
              onClick={handleManualSubmit}
              className="px-6 py-2 bg-ow-orange-500 text-white font-semibold rounded-md hover:bg-ow-orange-500/90"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingArea;
