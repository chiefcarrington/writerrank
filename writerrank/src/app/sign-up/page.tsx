// src/app/sign-up/page.tsx
import { SignUp } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

/**
 * The SignUpPage displays Clerk’s SignUp component.
 * New users can create an account and then complete onboarding.
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <SignUp
        appearance={{
          elements: {
            // Customize the form appearance here or remove appearance for default styling
          },
        }}
        path="/sign-up"
        routing="path"
      />
    </div>
  );
}
