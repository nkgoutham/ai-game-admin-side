/**
 * Auth Context Provider for Ether Excel
 * Manages authentication state and user roles
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'teacher' | 'player') => Promise<void>;
  signOut: () => Promise<void>;
  joinAsPlayer: (name: string) => Promise<void>;
  isTeacher: () => boolean;
  isPlayer: () => boolean;
}

const defaultAuthState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  // Load auth state on mount
  useEffect(() => {
    // Check if there's a force logout flag in local storage
    const forceLogout = localStorage.getItem('force_logout');
    
    // If force logout is set, clear any session first
    if (forceLogout === 'true') {
      localStorage.removeItem('force_logout');
      supabase.auth.signOut().then(() => {
        setAuthState({ user: null, isLoading: false, error: null });
      });
      return;
    }
    
    const loadUser = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthState({ user: null, isLoading: false, error: null });
          return;
        }
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setAuthState({ 
            user: profile as UserProfile, 
            isLoading: false, 
            error: null 
          });
        } else {
          // User has auth record but no profile
          setAuthState({ 
            user: null, 
            isLoading: false, 
            error: 'Profile not found' 
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setAuthState({ 
          user: null, 
          isLoading: false, 
          error: 'Error loading user' 
        });
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setAuthState({ user: null, isLoading: false, error: null });
      }
    });

    loadUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState({ ...authState, isLoading: true, error: null });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // User profile will be loaded by the auth state change handler
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState({ 
        ...authState, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in' 
      });
    }
  };

  const signUp = async (email: string, password: string, role: 'teacher' | 'player') => {
    try {
      setAuthState({ ...authState, isLoading: true, error: null });
      
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      if (data.user) {
        // Update the role in the profile (default is 'player')
        if (role === 'teacher') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'teacher' })
            .eq('id', data.user.id);
          
          if (updateError) throw updateError;
        }
      }
      
      // User profile will be loaded by the auth state change handler
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState({ 
        ...authState, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign up' 
      });
    }
  };

  const signOut = async () => {
    try {
      setAuthState({ ...authState, isLoading: true });
      
      // Set a flag to ensure we force logout on next page load
      localStorage.setItem('force_logout', 'true');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setAuthState({ user: null, isLoading: false, error: null });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState({ 
        ...authState, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign out' 
      });
    }
  };

  const joinAsPlayer = async (name: string) => {
    try {
      setAuthState({ ...authState, isLoading: true, error: null });
      
      // Find any available game session
      // For now, we'll create a dummy session ID if none exists
      let sessionId = 'temp-session-id';
      
      // Create a new student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          name,
          session_id: sessionId
        })
        .select()
        .single();
      
      if (studentError) {
        console.error('Error creating student record:', studentError);
        throw new Error('Could not join the lobby. Please try again.');
      }
      
      // Store the student info in local storage
      localStorage.setItem('student', JSON.stringify(student));
      
      // Update auth state with a pseudo-user with player role
      setAuthState({ 
        user: {
          id: student.id,
          role: 'player',
          display_name: name
        },
        isLoading: false, 
        error: null 
      });
      
    } catch (error) {
      console.error('Join lobby error:', error);
      setAuthState({ 
        ...authState, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to join lobby' 
      });
    }
  };

  const isTeacher = () => {
    return authState.user?.role === 'teacher';
  };

  const isPlayer = () => {
    return authState.user?.role === 'player';
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn,
        signUp,
        signOut,
        joinAsPlayer,
        isTeacher,
        isPlayer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};