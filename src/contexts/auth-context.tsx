
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase/config'; // Import db
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions

interface AuthContextType {
  user: FirebaseUser | null;
  loadingAuth: boolean;
  signOut: () => Promise<void>;
  // Expose a function to allow components (like signup form) to trigger user data save if needed,
  // though it's primarily handled internally on signup.
  saveUserToFirestore: (user: FirebaseUser, additionalData?: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
      router.push('/login'); 
    } catch (error) {
      console.error('Error signing out: ', error);
      // Consider using toast for error feedback
      // toast({ variant: 'destructive', title: 'Erro ao sair', description: 'Não foi possível encerrar a sessão.'})
    }
  };

  const saveUserToFirestore = async (firebaseUser: FirebaseUser, additionalData: Record<string, any> = {}) => {
    if (!firebaseUser) return;
    const userDocRef = doc(db, "users", firebaseUser.uid);
    try {
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(), // Firestore server-side timestamp
        ...additionalData, // Allows passing additional data like name from signup form
      }, { merge: true }); // Use merge: true to avoid overwriting existing data if called multiple times
    } catch (error) {
      console.error("Error saving user to Firestore: ", error);
      // Potentially show a toast to the user
    }
  };


  return (
    <AuthContext.Provider value={{ user, loadingAuth, signOut, saveUserToFirestore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
