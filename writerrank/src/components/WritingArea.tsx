// src/components/WritingArea.tsx
"use client"; // This component uses client-side hooks

import React, { useState, useEffect, useRef } from 'react';

interface WritingAreaProps {
  isWritingActive: boolean;
  onStartWriting: () => void;
  onTimeUp: (finalText: string) => void;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isWritingActive) {
      setTimeLeft(WRITING_DURATION_SECONDS);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            onTimeUp(text);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWritingActive, onTimeUp, text]); // Added text to dependencies of onTimeUp call

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
      {/* For MVP, common text formatting UI is out of scope. This would be added here. */}
      {/* Example: <RichTextToolbar editor={editor} /> */}

      <div className="mt-4 flex justify-end items-center">
        {!isWritingActive && !locked && (
          <button
            onClick={() => {
              setText(""); // Clear text on new start
              onStartWriting();
            }}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Start
          </button>
        )}
        {isWritingActive && (
          <div className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md">
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
        {locked && !isWritingActive && ( // Show timer at 00:00 when locked after completion
            <div className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md">
                Time Up! {formatTime(0)}
            </div>
        )}
      </div>
    </div>
  );
};

export default WritingArea;