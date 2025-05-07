'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase/config'; // Import db
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; // Import Firestore functions

// Define a type for the user data stored in Firestore
export interface FirestoreUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: any; // serverTimestamp will be an object, then a Timestamp
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  firestoreUser: FirestoreUser | null;
  loadingAuth: boolean;
  loadingFirestoreUser: boolean;
  signOut: () => Promise<void>;
  saveUserToFirestore: (user: FirebaseUser, additionalData?: Record<string, any>) => Promise<void>;
  updateUserOnboardingStatus: (userId: string, completed: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingFirestoreUser, setLoadingFirestoreUser] = useState(true);
  const router = useRouter();

  const fetchFirestoreUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      setLoadingFirestoreUser(true);
      const userDocRef = doc(db, "users", firebaseUser.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setFirestoreUser(docSnap.data() as FirestoreUser);
        } else {
          // This case might happen if user record wasn't created properly
          // or if a new user signs up and fetch is called before saveUserToFirestore completes.
          // For signup, saveUserToFirestore handles initial creation.
          console.log("No such user document in Firestore!");
          setFirestoreUser(null); 
        }
      } catch (error) {
        console.error("Error fetching user from Firestore:", error);
        setFirestoreUser(null);
      } finally {
        setLoadingFirestoreUser(false);
      }
    } else {
      setFirestoreUser(null);
      setLoadingFirestoreUser(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      await fetchFirestoreUser(currentUser);
    });
    return () => unsubscribe();
  }, [fetchFirestoreUser]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state and firestoreUser state will be updated by onAuthStateChanged listener
      router.push('/login'); 
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const saveUserToFirestore = async (firebaseUser: FirebaseUser, additionalData: Record<string, any> = {}) => {
    if (!firebaseUser) return;
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userData: FirestoreUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      onboardingCompleted: false, // Initialize onboarding as not completed
      ...additionalData,
    };
    try {
      await setDoc(userDocRef, userData, { merge: true });
      setFirestoreUser(userData); // Update local state immediately
    } catch (error) {
      console.error("Error saving user to Firestore: ", error);
    }
  };

  const updateUserOnboardingStatus = async (userId: string, completed: boolean) => {
    if (!userId) return;
    const userDocRef = doc(db, "users", userId);
    try {
      await updateDoc(userDocRef, { onboardingCompleted: completed });
      if (firestoreUser && firestoreUser.uid === userId) {
        setFirestoreUser(prev => prev ? { ...prev, onboardingCompleted: completed } : null);
      }
      toast({title: "Progresso salvo!", description: "Status de onboarding atualizado."})
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({title: "Erro", description: "Não foi possível atualizar o status de onboarding.", variant: "destructive"})
    }
  };

  return (
    <AuthContext.Provider value={{ user, firestoreUser, loadingAuth, loadingFirestoreUser, signOut, saveUserToFirestore, updateUserOnboardingStatus }}>
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

// Helper hook for toasts, assuming it exists (as per original structure)
import { useToast as useActualToast } from '@/hooks/use-toast';
const toast = ({...args}) => {
    // This is a mock if the actual toast isn't readily available or needed for this specific change
    // In a real scenario, ensure useToast is correctly imported and works
    const actualToast = useActualToast ? useActualToast().toast : console.log;
    actualToast(args);
};
