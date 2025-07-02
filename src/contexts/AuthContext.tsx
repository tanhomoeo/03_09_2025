
'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth as firebaseAuthInstance } from '@/lib/firebase';
import { ADMIN_USER_IDS } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: Error | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async (email, password) => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, 
      (currentUser) => {
        setUser(currentUser);
        // Securely check admin status based on UID from constants
        setIsAdmin(!!currentUser && ADMIN_USER_IDS.includes(currentUser.uid));
        setLoading(false);
        setAuthError(null);
      }, 
      (error) => {
        console.error("Firebase Auth State Error:", error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setAuthError(error);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(firebaseAuthInstance, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(firebaseAuthInstance, email, password);
    } catch(error) {
        console.error("Error during email/password sign-in:", error);
        throw error;
    }
  };
  
  const signOutUser = async () => {
    try {
      await signOut(firebaseAuthInstance);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    signOutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
