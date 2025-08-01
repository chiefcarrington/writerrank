// src/components/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

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
  initialText = '',
  onTextChange,
  locked,
}) => {
  const [text, setText] = useState(initialText);
  const [timeLeft, setTimeLeft] = useState(WRITING_DURATION_SECONDS);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // stable refs for callbacks & state inside RAF loop
  const onTimeUpRef = useRef(onTimeUp);
  const isAnonymousRef = useRef(isAnonymous);
  const currentTextRef = useRef(text);

  useEffect(() => {
    currentTextRef.current = text;
  }, [text]);
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
      }

      setTimeLeft(Math.ceil(remaining));
      rafRef.current = requestAnimationFrame(update);
    };

    if (isWritingActive) {
      setTimeLeft(WRITING_DURATION_SECONDS);
      textAreaRef.current?.focus();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = Date.now();
      rafRef.current = requestAnimationFrame(update);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isWritingActive]);

  useEffect(() => {
    onTextChange(text);
  }, [text, onTextChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!locked && isWritingActive) setText(e.target.value);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  const timerColor =
    timeLeft <= 30
      ? 'text-red-500'
      : timeLeft <= 60
      ? 'text-[color:var(--ow-orange-500)]'
      : 'text-[color:var(--ow-neutral-50)]';

  const handleManualSubmit = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onTimeUp(currentTextRef.current, isAnonymous);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-lg overflow-hidden shadow-inner relative">
        <Textarea
          ref={textAreaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={
            isWritingActive
              ? 'Start writing...'
              : 'Click START to begin your 3-minute writing challenge'
          }
          disabled={locked || !isWritingActive}
          aria-label="Writing input"
          className="min-h-[320px] w-full border-none rounded-none
                     resize-none text-base leading-relaxed
                     text-[color:var(--ow-neutral-900)]
                     bg-white/60 backdrop-blur-sm shadow-inner
                     focus:ring-[color:var(--ow-orange-500)]
                     focus:border-[color:var(--ow-orange-500)]"
        />

        <div className="bg-[color:var(--ow-neutral-900)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isWritingActive && (
              <label
                htmlFor="anonymous-checkbox"
                className="flex items-center cursor-pointer select-none"
              >
                <input
                  id="anonymous-checkbox"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300
                             text-[color:var(--ow-orange-500)]
                             focus:ring-[color:var(--ow-orange-500)]"
                />
                <span className="ml-2">Post anonymously</span>
              </label>
            )}
            <div className="text-sm text-[color:var(--ow-neutral-50)]/80">
              {text.length} characters
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isWritingActive && (
              <span className={`font-mono text-lg ${timerColor}`}>
                {formatTime(timeLeft)}
              </span>
            )}

            {!isWritingActive && !locked && (
              <Button
                onClick={() => {
                  setText('');
                  onStartWriting();
                }}
                className="px-6 py-2 rounded-md shadow-lg
                           bg-[color:var(--ow-orange-500)] text-white
                           hover:bg-[color:var(--ow-orange-500)]/90"
              >
                START
              </Button>
            )}

            {isWritingActive && (
              <Button
                onClick={handleManualSubmit}
                className="px-6 py-2 rounded-md shadow-lg
                           bg-[color:var(--ow-orange-500)] text-white
                           hover:bg-[color:var(--ow-orange-500)]/90"
              >
                SUBMIT
              </Button>
            )}

            {!isWritingActive && locked && (
              <Button
                disabled
                className="px-6 py-2 rounded-md shadow-lg
                           bg-[color:var(--ow-orange-500)] text-white
                           opacity-75"
              >
                SUBMITTED
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingArea;
