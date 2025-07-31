import { Button } from './ui/button';

export function Header() {
  const handleSignIn = () => {
    // Placeholder for sign in functionality
    console.log('Sign in clicked');
  };

  const handleSignUp = () => {
    // Placeholder for sign up functionality
    console.log('Sign up clicked');
  };

  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Site Title */}
        <div>
          <h1 className="text-2xl text-[color:var(--ow-neutral-900)]">
            Open Write
          </h1>
        </div>

        {/* Sign In/Up Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSignIn}
            className="text-[color:var(--ow-neutral-900)] hover:bg-gray-100"
          >
            Sign In
          </Button>
          <Button
            onClick={handleSignUp}
            className="bg-[color:var(--ow-orange-500)] hover:bg-[color:var(--ow-orange-500)]/90 text-white"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}