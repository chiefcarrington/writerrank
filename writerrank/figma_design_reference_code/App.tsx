import { Header } from './components/Header';
import { WritingArea } from './components/WritingArea';

// Sample daily prompt - in a real app, this would come from your backend
const dailyPrompt = "Write about a moment when you discovered something unexpected about yourself. What led to this realization, and how did it change your perspective?";

export default function App() {
  return (
    <div className="min-h-screen bg-[color:var(--ow-orange-50)]">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <WritingArea prompt={dailyPrompt} />
      </main>
    </div>
  );
}