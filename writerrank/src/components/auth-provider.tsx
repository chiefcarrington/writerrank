// src/components/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// Import the singleton client instance directly
import { supabase } from '@/lib/supabase/client';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
};

type SupabaseContextType = {
  // We no longer pass the supabase client via context, as it can be imported directly.
  // This is a stylistic choice, but it simplifies the provider.
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
  const [isLoading, setIsLoading] = useState(true);

  // This one-time effect will run on mount to handle all auth logic.
  useEffect(() => {
    // This function fetches the initial session and profile.
    const getInitialSession = async () => {
      const { data: { session }, } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile as Profile | null);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // This listener handles all subsequent auth events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile as Profile | null);
        } else {
          setProfile(null);
        }

        // Ensure loading is false after any auth event.
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // This effect handles the redirect to onboarding if necessary.
  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading.
    
    if (user && profile && !profile.username && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, profile, isLoading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect to home after logout
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