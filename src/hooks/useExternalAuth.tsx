import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { externalSupabase } from '@/integrations/external-supabase/client';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const ExternalAuthContext = createContext<AuthContextType | undefined>(undefined);

export function ExternalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = externalSupabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    externalSupabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Handle deep links for mobile OAuth redirect
    App.addListener('appUrlOpen', async ({ url }) => {
      if (url.includes('google-auth')) {
        // Parse the URL fragment (Supabase returns access_token in hash)
        const fragment = url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await externalSupabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      App.removeAllListeners();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await externalSupabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await externalSupabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await externalSupabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await externalSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Determine the redirect URL based on the platform
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.recipegenie.app://google-auth'
      : `${window.location.origin}/`;

    const { error } = await externalSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await externalSupabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Force clear state to ensure UI updates immediately
      setUser(null);
      setSession(null);
    }
  };

  return (
    <ExternalAuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      updatePassword,
      resetPasswordForEmail,
      signOut
    }}>
      {children}
    </ExternalAuthContext.Provider>
  );
}

export function useExternalAuth() {
  const context = useContext(ExternalAuthContext);
  if (context === undefined) {
    throw new Error('useExternalAuth must be used within an ExternalAuthProvider');
  }
  return context;
}
