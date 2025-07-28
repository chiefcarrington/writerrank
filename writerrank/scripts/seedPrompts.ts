import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  // Add more prompts here if desired
];

async function seed() {
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i));
    const dateString = date.toISOString().split('T')[0];
    const promptText = prompts[i % prompts.length];

    const { error } = await supabase
      .from('prompts')
      .upsert({ date_shown: dateString, prompt_text: promptText }, { onConflict: 'date_shown' });

    if (error) {
      console.error(`Error inserting prompt for ${dateString}:`, error.message);
    } else {
      console.log(`Seeded prompt for ${dateString}`);
    }
  }

  console.log('Done');
}

seed();
