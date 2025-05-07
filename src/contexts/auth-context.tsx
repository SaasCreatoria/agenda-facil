
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 

interface AuthContextType {
  user: FirebaseUser | null;
  loadingAuth: boolean;
  signOut: () => Promise<void>;
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

  return (
    <AuthContext.Provider value={{ user, loadingAuth, signOut }}>
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
