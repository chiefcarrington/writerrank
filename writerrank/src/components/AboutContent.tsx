"use client";

import DonationWidget from "./DonationWidget";
import EmailForm from "./EmailForm";

export default function AboutContent() {
  return (
    <article className="prose prose-lg max-w-none max-w-4xl mx-auto px-6">
      {/* Hero section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[color:var(--ow-orange-500)]">About OpenWrite</h1>
        <p className="text-xl text-[color:var(--ow-neutral-900)]">A simple daily writing challenge to spark your creativity.</p>
      </section>

      {/* Mission sections */}
      <section>
        <h2 className="text-[color:var(--ow-neutral-900)]">The Daily Practice That Changes Everything</h2>
        <p>
          Writing a little every day builds momentum. OpenWrite encourages a consistent habit with short, focused sessions that keep you coming back.
        </p>
      </section>

      <section>
        <h2 className="text-[color:var(--ow-neutral-900)]">Why Time-Boxing Works</h2>
        <p>
          When you have just a few minutes, you avoid overthinking. The timer frees you to get words down and silences the inner critic, letting creativity flow.
        </p>
      </section>

      <section>
        <h2 className="text-[color:var(--ow-neutral-900)]">Where We Are (And Where We&apos;re Going)</h2>
        <p>
          OpenWrite is still growing. We&apos;re iterating in public and building features that make daily writing easier, more fun, and more collaborative.
        </p>
      </section>

      <section>
        <h2 className="text-[color:var(--ow-neutral-900)]">Built by Writers, For Writers</h2>
        <p>
          We&apos;re a small team of writers and makers who want a tool that respects creativity and privacy. No ads, no distractions—just space to write.
        </p>
      </section>

      {/* Donation section with DonationWidget */}
      <section>
        <h2 className="text-[color:var(--ow-neutral-900)]">Support Independent Software</h2>
        <p>
          If you believe in tools that put writers first, consider supporting the project. Every contribution helps keep OpenWrite independent.
        </p>
        <DonationWidget />
      </section>

      {/* Email signup section */}
      <section>
        <h2 className="text-[color:var(--ow-neutral-900)]">Join the Movement</h2>
        <p>
          Get updates and prompts delivered straight to your inbox. Sign up and be part of the OpenWrite community.
        </p>
        <EmailForm />
      </section>
    </article>
  );
}

