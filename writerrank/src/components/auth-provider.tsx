// src/components/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation'; // Import router and pathname hooks

// Define a type for our public profile data
export type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
};

// Define the type for our context, now including the user's profile
type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Add profile to the context
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(userProfile as Profile | null);
      }
      setIsLoading(false);
    };
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setProfile(userProfile as Profile | null);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);


  // VVVVVV NEW LOGIC TO REDIRECT USERS VVVVVV
  useEffect(() => {
    // If loading is finished and we have a user, but they don't have a username
    if (!isLoading && user && profile && !profile.username) {
      // And they are not already on the onboarding page
      if (pathname !== '/onboarding') {
        // Redirect them to the onboarding page
        router.push('/onboarding');
      }
    }
  }, [user, profile, isLoading, pathname, router]);
  // ^^^^^ END OF NEW LOGIC ^^^^^


  const value = { supabase, session, user, profile, isLoading };

  return (
    <SupabaseContext.Provider value={value}>
      {!isLoading && children}
    </SupabaseContext.Provider>
  );
}

// Custom hook to easily access the context
export const useAuth = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};