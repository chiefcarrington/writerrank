// src/app/sign-in/page.tsx
import { SignIn } from '@clerk/nextjs';

/**
 * The SignInPage displays Clerk’s SignIn component.
 * Users can sign in or switch to sign up from this component.
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            // Customize the form appearance here or remove appearance for default styling
          },
        }}
        path="/sign-in"
        routing="path"
      />
    </div>
  );
}
