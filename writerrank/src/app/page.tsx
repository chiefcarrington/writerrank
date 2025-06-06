// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { getPromptOfTheDay } from '../lib/dailyPrompt';
import PromptDisplay from '../components/PromptDisplay';
import WritingArea from '../components/WritingArea';
import CompletionView from '../components/CompletionView';

type ViewMode = 'initial' | 'writing' | 'completed';

export default function HomePage() {
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [submission, setSubmission] = useState<string>("");
  const [dailyPromptId, setDailyPromptId] = useState<string>("");

  const setupDailyChallenge = useCallback(() => {
    const prompt = getPromptOfTheDay();
    const today = new Date().toDateString();

    if (dailyPromptId !== today) {
      localStorage.removeItem(`submission_${dailyPromptId}`);
      localStorage.removeItem(`completed_${dailyPromptId}`);
    }

    setCurrentPrompt(prompt);
    setDailyPromptId(today);

    const alreadyCompleted = localStorage.getItem(`completed_${today}`);
    const savedSubmission = localStorage.getItem(`submission_${today}`);

    if (alreadyCompleted && savedSubmission) {
      setSubmission(savedSubmission);
      setViewMode('completed');
    } else {
      setSubmission("");
      setViewMode('initial');
    }
  }, [dailyPromptId]);

  useEffect(() => {
    setupDailyChallenge();
  }, [setupDailyChallenge]);

  const handleStartWriting = () => {
    setSubmission("");
    setViewMode('writing');
  };

  const handleTextChange = useCallback((text: string) => {
    if (viewMode === 'writing') {
        setSubmission(text);
    }
  }, [viewMode]);

  const handleTimeUp = useCallback((finalText: string) => {
    setSubmission(finalText);
    setViewMode('completed');
    localStorage.setItem(`completed_${dailyPromptId}`, 'true');
    localStorage.setItem(`submission_${dailyPromptId}`, finalText);
  }, [dailyPromptId]);

  const handleWriteAgain = () => {
    setupDailyChallenge();
  };

  return (
    <>
      <Head>
        <title>OpenWrite</title>
        <meta name="description" content="Your daily 3-minute writing challenge. Join the waitlist!" />
        {/* <link rel="icon" href="/favicon.ico" /> Ensure your favicon is in public folder */}
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-100 to-sky-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
          <header className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              OpenWrite 🖋️
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              One prompt. Three minutes. No second chances.
            </p>
          </header>

          {viewMode !== 'completed' && <PromptDisplay prompt={currentPrompt} />}

          {viewMode === 'initial' && currentPrompt && (
            <WritingArea
              isWritingActive={false}
              onStartWriting={handleStartWriting}
              onTimeUp={() => {}}
              onTextChange={() => {}}
              locked={false}
              initialText=""
            />
          )}

          {viewMode === 'writing' && currentPrompt && (
            <WritingArea
              isWritingActive={true}
              onStartWriting={() => {}}
              onTimeUp={handleTimeUp}
              onTextChange={handleTextChange}
              initialText={submission}
              locked={false}
            />
          )}

          {viewMode === 'completed' && (
            <>
              <PromptDisplay prompt={currentPrompt} />
              <CompletionView
                submission={submission}
                currentPrompt={currentPrompt} // Pass currentPrompt here
                onWriteAgain={handleWriteAgain}
              />
            </>
          )}
        </div>
        <footer className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WriterRank. Inspired by daily challenges.</p>
        </footer>
      </main>
    </>
  );
}