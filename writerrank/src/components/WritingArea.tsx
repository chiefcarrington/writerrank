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

  const currentTextRef = useRef(text);
  useEffect(() => {
    currentTextRef.current = text;
  }, [text]);

  useEffect(() => {
    if (isWritingActive) {
      setTimeLeft(WRITING_DURATION_SECONDS);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            onTimeUp(currentTextRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isWritingActive, onTimeUp]);

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
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    onTimeUp(currentTextRef.current);
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
        {!isWritingActive && !locked && (
          <button
            onClick={() => {
              setText("");
              onStartWriting();
            }}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Start
          </button>
        )}

        {/* VVVVVV MODIFIED HERE: Added Submit button and flex container VVVVVV */}
        {isWritingActive && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleManualSubmit}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Finish and submit your writing early"
            >
              Submit
            </button>
            <div className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>
        )}
        {/* ^^^^^ END OF MODIFICATION ^^^^^ */}

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