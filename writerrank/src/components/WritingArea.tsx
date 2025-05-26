// src/components/WritingArea.tsx
"use client";

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
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Ref to hold the latest text for onTimeUp, avoiding `text` as a direct dependency for the timer effect.
  const currentTextRef = useRef(text);
  useEffect(() => {
    currentTextRef.current = text;
  }, [text]);

  // Effect to handle starting/stopping the timer and resetting timeLeft
  useEffect(() => {
    if (isWritingActive) {
      // Reset timer and focus when writing becomes active
      setTimeLeft(WRITING_DURATION_SECONDS);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }

      // Clear any existing interval before starting a new one
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerIntervalRef.current) { // Ensure it exists before clearing
                clearInterval(timerIntervalRef.current);
            }
            onTimeUp(currentTextRef.current); // Use the ref to get the latest text
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // If writing is not active, ensure the timer is cleared
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    // Cleanup function: clears interval when component unmounts or `isWritingActive` changes before effect re-runs.
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isWritingActive, onTimeUp]);

  // Effect to propagate text changes to the parent
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

      <div className="mt-4 flex justify-end items-center">
        {/* Show Start button only if not writing and not locked (initial state) */}
        {!isWritingActive && !locked && (
          <button
            onClick={() => {
              setText(""); // Clear local text state immediately
              onStartWriting(); // Notify parent to change mode and handle other logic
            }}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Start
          </button>
        )}
        {/* Show timer when actively writing */}
        {isWritingActive && (
          <div className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md">
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
        {/* Show "Time Up! 00:00" when locked after completion (and not writing) */}
        {locked && !isWritingActive && (
            <div className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md">
                Time Up! {formatTime(0)}
            </div>
        )}
      </div>
    </div>
  );
};

export default WritingArea;