// src/app/login/page.tsx
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <header className="text-center mb-8">
        <Link href="/" className="text-decoration-none">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 cursor-pointer">
            OpenWrite
          </h1>
        </Link>
        <p className="text-gray-500 mt-2">Your daily writing challenge.</p>
      </header>
      <AuthForm/>
    </main>
  );
}