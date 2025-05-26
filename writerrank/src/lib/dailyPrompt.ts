// src/lib/dailyPrompt.ts

const prompts: string[] = [
    "Describe a color you've never seen.",
    "What does 'home' smell like after a long journey?",
    "If silence had a sound, what would it be?",
    "Write about a door that only appears at midnight.",
    "The most important lesson a tree could teach us.",
    "What if your shadow had a life of its own?",
    "Describe the taste of joy.",
    "A conversation between the moon and the sea.",
    "The secret life of a forgotten toy.",
    "What would you write on a message in a bottle today?",
    // Add more prompts here to cover more days
  ];
  
  export function getPromptOfTheDay(): string {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return prompts[dayOfYear % prompts.length] || "Write about a moment of pure, unexpected happiness.";
  }