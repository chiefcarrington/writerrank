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
  initialText = "", // Used when the component mounts in 'initial' or 'writing' state
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

      // Clear any existing interval before starting a new one (belt and braces)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current!);
            onTimeUp(currentTextRef.current); // Use the ref to get the latest text
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // If writing is not active, ensure the timer is cleared and reset display
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Optionally, if you want the timer to show full duration when not active but visible (e.g. before start)
      // You might adjust this based on whether it's 'initial' state or 'completed' state.
      // For now, it just stops. `HomePage` handles showing 00:00 on completion.
    }

    // Cleanup function: clears interval when component unmounts or `isWritingActive` changes before effect re-runs.
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isWritingActive, onTimeUp]); // Dependencies:
                                    // - `isWritingActive`: Starts/stops the timer.
                                    // - `onTimeUp`: Needs to be stable (useCallback in HomePage, which it is).

  // Effect to propagate text changes to the parent
  useEffect(() => {
    // Synchronize internal text state with parent if initialText prop changes
    // This is useful if the parent component could change the text externally after mount
    // For this app, `initialText` is primarily for the first text when the component appears in writing mode.
    // However, `HomePage` passes `submission` as `initialText` when `viewMode === 'writing'`.
    // `submission` updates on every keystroke. This means `initialText` prop changes.
    // `useState(initialText)` only sets the *initial* state.
    // If we want `WritingArea`'s text to be strictly controlled by `initialText` prop after mount, we'd do:
    // setText(initialText);
    // But this makes `WritingArea` a fully controlled component for its text, which might be what we want.
    // Let's keep the current behavior where internal `text` state drives updates,
    // and `initialText` is just for the very start or if `HomePage` specifically clears it.
    // The `setText("")` in the Start button's onClick is key for reset.
    onTextChange(text);
  }, [text, onTextChange]); // `onTextChange` should be stable (useCallback in HomePage).


  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!locked && isWritingActive) { // Ensure writing is active and not locked
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
        disabled={locked || !isWritingActive && viewMode !== 'initial'} // More precise disabled logic
        className="w-full h-64 p-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base"
        aria-label="Writing input"
      />

      <div className="mt-4 flex justify-end items-center">
        {!isWritingActive && !locked && ( // Only show Start button if not active and not locked (i.e., initial state)
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
        {isWritingActive && ( // Show timer when actively writing
          <div className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md">
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
        {locked && !isWritingActive && ( // Show "Time Up! 00:00" when locked after completion
            <div className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md">
                Time Up! {formatTime(0)}
            </div>
        )}
      </div>
    </div>
  );
};
// A small helper to clarify the disabled logic in textarea
// (This is a conceptual note, not actual code to add, the logic is embedded above)
const viewMode = isWritingActive ? 'writing' : (locked ? 'completed' : 'initial');
// textarea disabled={locked || (viewMode !== 'initial' && viewMode !== 'writing')}
// textarea disabled={locked || !isWritingActive} // This was the previous one.
// Let's simplify the textarea disabled logic for now:
// disabled={locked || !isWritingActive}
// This means if it's not locked, it's only enabled if isWritingActive is true.
// If it's locked, it's always disabled. This should be fine.
// The placeholder also changes based on `isWritingActive`.

export default WritingArea;