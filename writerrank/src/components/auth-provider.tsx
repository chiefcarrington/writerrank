// src/components/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            // Fetch profile for logged-in user
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialSession.user.id)
              .single();
              
            if (profileError) {
              console.error('Error fetching profile:', profileError);
            }
            
            if (mounted) {
              setProfile(userProfile as Profile | null);
            }
          } else {
            setProfile(null);
          }
          
          setInitialLoadComplete(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Exception getting initial session:', error);
        if (mounted) {
          setInitialLoadComplete(true);
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data: userProfile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error('Error fetching profile after auth change:', error);
            }
            
            if (mounted) {
              setProfile(userProfile as Profile | null);
            }
          } catch (error) {
            console.error('Exception fetching profile:', error);
          }
        } else {
          setProfile(null);
        }
        
        // Only update loading state after initial load is complete
        if (initialLoadComplete && mounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialLoadComplete]);

  // Handle onboarding redirect
  useEffect(() => {
    if (isLoading || !initialLoadComplete) {
      return;
    }
    
    if (user && profile && !profile.username && pathname !== '/onboarding') {
      console.log('Redirecting to onboarding for user without username');
      router.push('/onboarding');
    }
  }, [user, profile, isLoading, initialLoadComplete, pathname, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = { session, user, profile, isLoading, signOut };

  return (
    <SupabaseContext.Provider value={value}>
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Loading Session...</p>
            <p className="text-xs text-gray-400 mt-2">
              If this takes too long, try refreshing the page
            </p>
          </div>
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