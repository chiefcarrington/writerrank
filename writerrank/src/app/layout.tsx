// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// Avoid build-time evaluation of Clerk which requires environment variables.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenWrite",
  description: "Your daily 3-minute writing challenge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <body>
          <header className="w-full bg-[color:var(--ow-orange-50)]">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <a href="/">
                <h1 className="text-2xl font-bold text-[color:var(--ow-neutral-900)]">
                  OpenWrite
                </h1>
              </a>

              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="px-4 py-2 rounded-md text-[color:var(--ow-neutral-900)] hover:bg-gray-100">
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <Button className="px-4 py-2 rounded-md bg-[color:var(--ow-orange-500)] hover:bg-[color:var(--ow-orange-500)]/90 text-white">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
