// src/components/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
};

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use useState to create a stable, single instance of the Supabase client
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const pathname = usePathname();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This listener handles all auth events: initial load, login, logout, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setIsLoading(true); // Set loading true at the start of any auth change
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // If a user is logged in, fetch their profile
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            // This can happen if the profile hasn't been created yet by the trigger
            console.warn('Could not fetch user profile:', error.message);
            setProfile(null);
          } else {
            setProfile(userProfile as Profile | null);
          }
        } else {
          // If user is logged out, clear the profile
          setProfile(null);
        }
      } catch (error) {
        console.error("Error in onAuthStateChange handler:", error);
      } finally {
        // Always set loading to false after processing is done
        setIsLoading(false);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);


  // The redirect logic effect remains the same
  useEffect(() => {
    if (!isLoading && user && profile && !profile.username) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, profile, isLoading, pathname, router]);

  const value = { supabase, session, user, profile, isLoading };

  return (
    <SupabaseContext.Provider value={value}>
      {/* Show a simple loading state to prevent screen flashing */}
      {isLoading ? <div className="h-screen w-full" /> : children}
    </SupabaseContext.Provider>
  );
}

// Custom hook remains the same
export const useAuth = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};