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

  const handleManualSubmit = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    onTimeUp(currentTextRef.current, isAnonymous); // Pass anonymity state
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={handleTextChange}
        placeholder={isWritingActive ? "Start writing..." : "Click Start to begin..."}
        disabled={locked || !isWritingActive}
        className="w-full h-64 p-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base"
        aria-label="Writing input"
      />

      <progress
        id="timer"
        max={WRITING_DURATION_SECONDS}
        value={WRITING_DURATION_SECONDS - timeLeft}
        className="w-full h-2 mt-2"
        style={{ accentColor: timeLeft <= 10 ? 'red' : 'green' }}
      />

      {/* Container for bottom controls */}
      <div className="mt-4 flex justify-between items-center">
        {/* Checkbox appears only when writing is active */}
        <div className="flex-grow">
            {isWritingActive && (
                <label htmlFor="anonymous-checkbox" className="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input
                        id="anonymous-checkbox"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Post anonymously</span>
                </label>
            )}
        </div>

        {/* Buttons on the right */}
        <div className="flex items-center gap-4">
            {!isWritingActive && !locked && (
            <button
                onClick={() => {
                setText("");
                onStartWriting();
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            >
                Start
            </button>
            )}

            {isWritingActive && (
            <>
                <button
                onClick={handleManualSubmit}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                Submit
                </button>
                <div
                className={`px-6 py-2 text-white font-semibold rounded-md ${timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                >
                Time Left: {formatTime(timeLeft)}
                </div>
            </>
            )}
            
            {locked && !isWritingActive && (
                <div className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md">
                    Time Up! {formatTime(0)}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WritingArea;