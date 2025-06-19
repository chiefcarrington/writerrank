// src/components/auth-provider.tsx (Corrected and Final Version)
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
    // 1. Proactively fetch the session on initial load
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

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
        console.error("Error fetching initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // 2. Listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfile(userProfile as Profile | null);
      } else {
        setProfile(null);
      }

      // When the user logs out, the loading is effectively done.
      if (_event === 'SIGNED_OUT') {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // This effect handles the redirect to onboarding
  useEffect(() => {
    // Don't redirect until the initial session load is complete
    if (isLoading) {
      return;
    }

    if (user && profile && !profile.username) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, profile, isLoading, pathname, router]);

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