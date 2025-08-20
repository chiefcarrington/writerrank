// src/app/page.tsx
'use client';

// Clerk is loaded client-side, so ensure this page is rendered dynamically.
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import PromptDisplay from '../components/PromptDisplay';
import WritingArea from '../components/WritingArea';
import CompletionView from '../components/CompletionView';

import { useUser } from '@clerk/nextjs';

type Prompt = {
  id: number;
  prompt_text: string;
};

type ViewMode = 'initial' | 'writing' | 'completed';

export default function HomePage() {
  // Use Clerk’s user hook instead of the old useAuth
  const { user } = useUser();
  const router = useRouter();

  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [submission, setSubmission] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);

  // Save a submission to the DB when the user is authenticated
  const handleSaveSubmissionToDb = useCallback(
    async (finalText: string, isAnonymous: boolean) => {
      if (!user || !currentPrompt) {
        console.log('Guest submission or missing data. Not saving to DB.');
        return;
      }
      try {
        const response = await fetch('/api/save-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: currentPrompt.id,
            submissionText: finalText,
            isAnonymous: isAnonymous,
          }),
        });
        if (response.redirected) {
          router.push(response.url);
        } else if (response.ok) {
          console.log('Submission saved to database for user:', user.id);
        } else {
          const data = await response.json();
          console.error('Failed to save submission:', data.error);
        }
      } catch (error) {
        console.error('API call to save submission failed:', error);
      }
    },
    [user, currentPrompt, router],
  );

  // Restore or reset daily challenge state from localStorage
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
      setSubmission('');
      setViewMode('initial');
    }
  }, [currentPrompt]);

  // Fetch today’s prompt once on mount
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

  // Restore any existing submission from localStorage when prompt changes
  useEffect(() => {
    if (currentPrompt) {
      setupDailyChallengeState();
    }
  }, [currentPrompt, setupDailyChallengeState]);

  const handleStartWriting = () => {
    setSubmission('');
    setViewMode('writing');
  };

  const handleTextChange = useCallback(
    (text: string) => {
      if (viewMode === 'writing') {
        setSubmission(text);
      }
    },
    [viewMode],
  );

  const handleTimeUp = useCallback(
    async (finalText: string, isAnonymous: boolean) => {
      if (!currentPrompt) return;
      setSubmission(finalText);
      setViewMode('completed');
      const today = new Date().toDateString();
      localStorage.setItem(`submission_${today}_${currentPrompt.id}`, finalText);
      localStorage.setItem(`completed_${today}_${currentPrompt.id}`, 'true');
      if (user) {
        await handleSaveSubmissionToDb(finalText, isAnonymous);
      }
    },
    [currentPrompt, user, handleSaveSubmissionToDb],
  );

  return (
    <>
      <Head>
        <title>OpenWrite - Daily Quick Write</title>
        <meta
          name="description"
          content="Your daily 3‑minute writing challenge."
        />
      </Head>

      <main className="container mx-auto px-6 py-12">
        {/* Prompt display and writing area */}
        {isLoadingPrompt ? (
          <div className="text-center p-8">Loading today's prompt...</div>
        ) : !currentPrompt ? (
          <div className="text-center p-8 text-red-600">
            No prompt available for today. Please check back later.
          </div>
        ) : (
          <>
            {viewMode !== 'completed' && (
              <PromptDisplay prompt={currentPrompt.prompt_text} />
            )}
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
                />
              </>
            )}
          </>
        )}
        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>
            &copy; {new Date().getFullYear()} OpenWrite. Inspired by daily
            challenges.
          </p>
        </footer>
      </main>
    </>
  );
}
