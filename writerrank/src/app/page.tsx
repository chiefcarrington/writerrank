// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PromptDisplay from '../components/PromptDisplay';
import WritingArea from '../components/WritingArea';
import CompletionView from '../components/CompletionView';
import { useAuth } from '@/components/auth-provider';

type Prompt = {
  id: number;
  prompt_text: string;
};

type ViewMode = 'initial' | 'writing' | 'completed';

export default function HomePage() {
  const { user } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [submission, setSubmission] = useState<string>("");
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);

  // This will handle the API call to save the submission
  const handleSaveSubmission = async (finalText: string, isAnonymous: boolean) => {
    if (!user) {
      console.log("No user, cannot save submission to DB.");
      return; // Can't save if user isn't logged in
    }
    if (!currentPrompt) {
      console.error("No current prompt, cannot save submission.");
      return;
    }

    try {
      await fetch('/api/save-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: currentPrompt.id,
          submissionText: finalText,
          isAnonymous: isAnonymous,
        }),
      });
      // Optionally handle success/error notification
    } catch (error) {
      console.error("Failed to save submission:", error);
    }
  };


  const setupDailyChallengeState = useCallback(() => {
    if (!currentPrompt) return;
    const today = new Date().toDateString();
    const storageKey = `submission_${today}_${currentPrompt.id}`;
    const completedKey = `completed_${today}_${currentPrompt.id}`;
    const savedSubmission = localStorage.getItem(storageKey);
    const alreadyCompleted = localStorage.getItem(completedKey);
    if (alreadyCompleted && savedSubmission) {
      setSubmission(savedSubmission);
      setViewMode('completed');
    } else {
      setSubmission("");
      setViewMode('initial');
    }
  }, [currentPrompt]);

  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoadingPrompt(true);
      try {
        const response = await fetch('/api/get-prompt');
        if (!response.ok) throw new Error('Failed to fetch prompt');
        const promptData: Prompt = await response.json();
        setCurrentPrompt(promptData);
      } catch (error) {
        console.error(error);
        setCurrentPrompt(null);
      } finally {
        setIsLoadingPrompt(false);
      }
    };
    fetchPrompt();
  }, []);

  useEffect(() => {
    if (currentPrompt) {
      setupDailyChallengeState();
    }
  }, [currentPrompt, setupDailyChallengeState]);


  const handleStartWriting = () => {
    if (!user) {
        // If user is not logged in, redirect them to the login page
        window.location.href = '/login';
        return;
    }
    setSubmission("");
    setViewMode('writing');
  };

  const handleTextChange = useCallback((text: string) => {
    if (viewMode === 'writing') {
        setSubmission(text);
    }
  }, [viewMode]);

  // This function is passed to WritingArea and called on submit/time up
  const handleTimeUp = useCallback(async (finalText: string, isAnonymous: boolean) => {
    if (!currentPrompt) return;

    setSubmission(finalText);
    setViewMode('completed');
    
    // Save to localStorage to remember completion status for the day
    const today = new Date().toDateString();
    localStorage.setItem(`submission_${today}_${currentPrompt.id}`, finalText);
    localStorage.setItem(`completed_${today}_${currentPrompt.id}`, 'true');

    // Call the function to save to the database
    await handleSaveSubmission(finalText, isAnonymous);
    
  }, [currentPrompt, handleSaveSubmission]);

  const handleWriteAgain = () => {
    setupDailyChallengeState();
  };


  return (
    <>
      <Head>
        <title>OpenWrite - Daily Quick Write</title>
        <meta name="description" content="Your daily 3-minute writing challenge." />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-sky-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
          <header className="text-center mb-6 sm:mb-8">
            <Link href="/" passHref>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 cursor-pointer">
                    OpenWrite 🖋️
                </h1>
            </Link>
            <p className="text-gray-500 mt-2">
              One prompt. Three minutes. No second chances.
            </p>
            {!user && <p className="mt-2 text-sm">Please <Link href="/login" className="text-indigo-600 hover:underline">sign in</Link> to write.</p>}
          </header>

          {isLoadingPrompt ? (
            <div className="text-center p-8">Loading today's prompt...</div>
          ) : !currentPrompt ? (
            <div className="text-center p-8 text-red-600">No prompt available for today. Please check back later.</div>
          ) : (
            <>
              {viewMode !== 'completed' && <PromptDisplay prompt={currentPrompt.prompt_text} />}

              {viewMode === 'initial' && (
                <WritingArea
                  isWritingActive={false}
                  onStartWriting={handleStartWriting}
                  onTimeUp={handleTimeUp}
                  onTextChange={() => {}}
                  locked={false}
                  initialText=""
                />
              )}

              {viewMode === 'writing' && (
                <WritingArea
                  isWritingActive={true}
                  onStartWriting={handleStartWriting}
                  onTimeUp={handleTimeUp}
                  onTextChange={handleTextChange}
                  initialText={submission}
                  locked={false}
                />
              )}

              {viewMode === 'completed' && (
                <>
                  <PromptDisplay prompt={currentPrompt.prompt_text} />
                  <CompletionView
                    submission={submission}
                    currentPrompt={currentPrompt.prompt_text}
                    onWriteAgain={handleWriteAgain}
                  />
                </>
              )}
            </>
          )}
        </div>
        <footer className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} OpenWrite. Inspired by daily challenges.</p>
        </footer>
      </main>
    </>
  );
}