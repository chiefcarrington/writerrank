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
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const pathname = usePathname();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setIsLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // VVVVVV MODIFIED BLOCK HERE VVVVVV
          // Fetch the profile, but don't assume it exists immediately.
          // Use .maybeSingle() which returns one row or null, without throwing an error if it's missing.
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle(); // Use maybeSingle() instead of single()
          // ^^^^^ END OF MODIFICATION ^^^^^

          if (error) {
            console.error('Error fetching profile:', error.message);
            setProfile(null);
          } else {
            setProfile(userProfile as Profile | null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("A critical error occurred in onAuthStateChange handler:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!isLoading && user && !profile) {
      // This case handles when the user is logged in, but their profile hasn't appeared yet.
      // We can add a small delay and refetch to give the trigger time to run.
      const retryTimeout = setTimeout(async () => {
        if (user) { // Check for user again inside timeout
          const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          setProfile(userProfile);
        }
      }, 1000); // Wait 1 second and try again

      return () => clearTimeout(retryTimeout);
    }

    if (!isLoading && user && profile && !profile.username) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, profile, isLoading, pathname, router, supabase]);

  const value = { supabase, session, user, profile, isLoading };

  return (
    <SupabaseContext.Provider value={value}>
      {isLoading 
        ? <div className="h-screen w-full flex items-center justify-center"><p className="text-gray-500">Loading Session...</p></div> 
        : children
      }
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