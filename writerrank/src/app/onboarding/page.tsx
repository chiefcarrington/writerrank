// src/app/onboarding/page.tsx
import OnboardingForm from '@/components/OnboardingForm';
import {
  SignedIn,
  SignedOut,
  SignInButton,
} from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

/**
 * OnboardingPage wraps the onboarding form in SignedIn/SignedOut.
 * Unauthenticated visitors are prompted to sign in first.
 */
export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-ow-orange-50 text-ow-neutral-900">
      <SignedOut>
        <div className="text-center space-y-4">
          <p className="text-gray-700">
            You must be signed in to complete onboarding.
          </p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-ow-orange-500 text-white font-semibold rounded-md">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <OnboardingForm />
      </SignedIn>
    </main>
  );
}
