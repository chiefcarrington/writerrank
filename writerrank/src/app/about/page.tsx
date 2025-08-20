import type { Metadata } from "next";
import AboutContent from '@/components/AboutContent';

export const metadata: Metadata = {
  title: "About OpenWrite - Daily Writing Challenge Platform",
  description: "Learn about OpenWrite's mission to make daily writing practice accessible to everyone. Discover our roadmap and support independent software.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ow-orange-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AboutContent />
      </div>
    </main>
  );
}
