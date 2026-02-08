import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  wizard_name: string;
  total_points: number;
  level: number;
  title: string;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    wizardName: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  logAction: (
    type: 'recycle' | 'energy' | 'donate',
    details: Record<string, unknown>,
    pointsAwarded: number,
    imagePath?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  addPoints: async () => {},
  logAction: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile fetch error (table may not exist yet):', error.message);
        // Create a local profile fallback
        setProfile({
          id: userId,
          wizard_name: session?.user?.user_metadata?.wizard_name || 'Apprentice',
          total_points: 0,
          level: 1,
          title: 'Novice EcoMage',
          avatar_url: null,
        });
        return;
      }

      setProfile(data as UserProfile);
    } catch (err) {
      console.log('Profile fetch failed:', err);
      setProfile({
        id: userId,
        wizard_name: 'Apprentice',
        total_points: 0,
        level: 1,
        title: 'Novice EcoMage',
        avatar_url: null,
      });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    wizardName: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { wizard_name: wizardName },
        },
      });

      if (error) return { error: error.message };

      // Try to create profile row
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            wizard_name: wizardName,
            total_points: 0,
            level: 1,
            title: 'Novice EcoMage',
          });
        } catch (profileErr) {
          console.log('Profile creation error (table may not exist):', profileErr);
        }
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: (err as Error).message };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: (err as Error).message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  const addPoints = async (points: number) => {
    if (!profile) return;

    const newTotal = profile.total_points + points;

    // Update local state immediately
    setProfile((prev) =>
      prev ? { ...prev, total_points: newTotal } : prev
    );

    // Try to update in DB
    try {
      await supabase
        .from('profiles')
        .update({ total_points: newTotal })
        .eq('id', profile.id);
    } catch (err) {
      console.log('Points update failed:', err);
    }
  };

  const logAction = async (
    type: 'recycle' | 'energy' | 'donate',
    details: Record<string, unknown>,
    pointsAwarded: number,
    imagePath?: string
  ) => {
    if (!session?.user) return;

    // Add points
    await addPoints(pointsAwarded);

    // Try to log action in DB
    try {
      await supabase.from('actions').insert({
        user_id: session.user.id,
        type,
        details,
        points_awarded: pointsAwarded,
        image_path: imagePath || null,
      });
    } catch (err) {
      console.log('Action log failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        addPoints,
        logAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
