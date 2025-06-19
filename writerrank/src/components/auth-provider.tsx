// src/components/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// Import the singleton client instance directly
import { supabase } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
};

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // We start in a loading state.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This listener is the single source of truth for auth state.
    // It fires on initial load, sign-in, sign-out, and token refresh.
    // We will not do anything until this listener gives us the initial session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // If a user is logged in, fetch their profile.
          // Using .single() is appropriate here because a logged-in user should always have a profile.
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile as Profile | null);
        } else {
          // If there's no session, there's no profile.
          setProfile(null);
        }
        
        // CRITICAL: We only set isLoading to false AFTER we have received
        // the initial auth state from the listener.
        setIsLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the listener when the component unmounts.
    return () => {
      subscription.unsubscribe();
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  // This separate effect handles redirecting the user to onboarding if needed.
  useEffect(() => {
    // We wait until the initial loading is complete before checking for redirects.
    if (isLoading) {
      return;
    }
    
    // If we have a user and profile, but the username is missing, redirect to onboarding.
    if (user && profile && !profile.username && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, profile, isLoading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // After signing out, onAuthStateChange will fire and clear the user/profile state.
    router.push('/');
  };

  const value = { session, user, profile, isLoading, signOut };

  return (
    <SupabaseContext.Provider value={value}>
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <p className="text-gray-500">Loading Session...</p>
        </div>
      ) : (
        children
      )}
    </SupabaseContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
