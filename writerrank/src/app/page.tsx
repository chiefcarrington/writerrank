// src/app/page.tsx
"use client"; // This page uses client-side state and effects

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
  const [dailyPromptId, setDailyPromptId] = useState<string>(""); // To track if prompt has changed

  // Function to initialize or reset the page state for a new prompt
  const setupDailyChallenge = useCallback(() => {
    const prompt = getPromptOfTheDay();
    const today = new Date().toDateString(); // Simple ID based on date string

    // If it's a new day/prompt, reset everything
    if (dailyPromptId !== today) {
      localStorage.removeItem(`submission_${dailyPromptId}`); // Clear old submission
      localStorage.removeItem(`completed_${dailyPromptId}`);
    }

    setCurrentPrompt(prompt);
    setDailyPromptId(today);

    // Check if user has already completed today's prompt
    const alreadyCompleted = localStorage.getItem(`completed_${today}`);
    const savedSubmission = localStorage.getItem(`submission_${today}`);

    if (alreadyCompleted && savedSubmission) {
      setSubmission(savedSubmission);
      setViewMode('completed');
    } else {
      setSubmission(""); // Reset submission for a fresh start if not completed
      setViewMode('initial');
    }
  }, [dailyPromptId]); // Add dailyPromptId to dependencies

  useEffect(() => {
    setupDailyChallenge();
  }, [setupDailyChallenge]); // Run once on mount and if setupDailyChallenge changes

  const handleStartWriting = () => {
    setSubmission(""); // Clear any previous transient text
    setViewMode('writing');
  };

  const handleTextChange = useCallback((text: string) => {
    // Only update submission if actively writing, to prevent overwriting completed text
    // with initial empty string from WritingArea if it re-renders.
    if (viewMode === 'writing') {
        setSubmission(text);
    }
  }, [viewMode]);

  const handleTimeUp = useCallback((finalText: string) => {
    setSubmission(finalText);
    setViewMode('completed');
    // Persist completion state and submission for the current day
    localStorage.setItem(`completed_${dailyPromptId}`, 'true');
    localStorage.setItem(`submission_${dailyPromptId}`, finalText);
  }, [dailyPromptId]);

  const handleWriteAgain = () => {
    // This button is more of a placeholder.
    // The actual "new prompt" logic is handled by dailyPromptId and setupDailyChallenge.
    // For now, it just re-evaluates the daily challenge setup.
    setupDailyChallenge();
  };

  return (
    <>
      <Head>
        <title>Daily Quick Write</title>
        <meta name="description" content="Your daily 3-minute writing challenge." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-100 to-sky-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
          <header className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Daily Quick Write 🖋️
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
              onTimeUp={() => {}} // Won't be called in this state
              onTextChange={() => {}} // Text changes handled by start
              locked={false}
            />
          )}

          {viewMode === 'writing' && currentPrompt && (
            <WritingArea
              isWritingActive={true}
              onStartWriting={() => {}} // Already started
              onTimeUp={handleTimeUp}
              onTextChange={handleTextChange}
              initialText={submission} // Ensure text persists if component re-renders during writing
              locked={false}
            />
          )}

          {viewMode === 'completed' && (
            <>
              <PromptDisplay prompt={currentPrompt} /> {/* Show prompt on completion page too */}
              <CompletionView submission={submission} onWriteAgain={handleWriteAgain} />
            </>
          )}
        </div>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Your App Name. Inspired by daily challenges.</p>
        </footer>
      </main>
    </>
  );
}

// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
