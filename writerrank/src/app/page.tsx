// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
// We no longer need the local getPromptOfTheDay function
// import { getPromptOfTheDay } from '../lib/dailyPrompt'; 
import PromptDisplay from '../components/PromptDisplay';
import WritingArea from '../components/WritingArea';
import CompletionView from '../components/CompletionView';
import AuthProvider, { useAuth } from '@/components/auth-provider'; // Import useAuth

// Define a type for our prompt object
type Prompt = {
  id: number;
  prompt_text: string;
};

type ViewMode = 'initial' | 'writing' | 'completed';

export default function HomePage() {
  const { user } = useAuth(); // Get user session info
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [submission, setSubmission] = useState<string>("");
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);

  // This will now handle checking for saved submissions in localStorage
  // The prompt fetching will be done in a separate effect
  const setupDailyChallengeState = useCallback(() => {
    if (!currentPrompt) return;

    const today = new Date().toDateString(); // Used as part of the key for localStorage
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

  // Effect to fetch the prompt from our API when the component loads
  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoadingPrompt(true);
      try {
        const response = await fetch('/api/get-prompt');
        if (!response.ok) {
          throw new Error('Failed to fetch prompt');
        }
        const promptData: Prompt = await response.json();
        setCurrentPrompt(promptData);
      } catch (error) {
        console.error(error);
        setCurrentPrompt(null); // Set to null if there's an error
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    fetchPrompt();
  }, []);

  // Effect to set up the daily challenge state once the prompt has been fetched
  useEffect(() => {
    if (currentPrompt) {
      setupDailyChallengeState();
    }
  }, [currentPrompt, setupDailyChallengeState]);


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
    if (!currentPrompt) return; // Should not happen, but a good check

    setSubmission(finalText);
    setViewMode('completed');

    const today = new Date().toDateString();
    const storageKey = `submission_${today}_${currentPrompt.id}`;
    const completedKey = `completed_${today}_${currentPrompt.id}`;
    
    // We still save to localStorage to remember completion status for the day
    localStorage.setItem(storageKey, finalText);
    localStorage.setItem(completedKey, 'true');

    // We will add the call to save to DB in the next step
    
  }, [currentPrompt]);

  const handleWriteAgain = () => {
    setupDailyChallengeState();
  };


  return (
    <>
      <Head>
        <title>OpenWrite - Daily Quick Write</title>
        <meta name="description" content="Your daily 3-minute writing challenge." />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-100 to-sky-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
          <header className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
              OpenWrite 🖋️
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              One prompt. Three minutes. No second chances.
            </p>
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
                  onTimeUp={() => {}}
                  onTextChange={() => {}}
                  locked={false}
                  initialText=""
                />
              )}

              {viewMode === 'writing' && (
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