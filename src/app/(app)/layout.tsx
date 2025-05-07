'use client'; 

import AppLayout from '@/components/layout/app-layout';
import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context'; 
import { useRouter, usePathname } from 'next/navigation'; 
import { useEffect } from 'react'; 
import { Skeleton } from '@/components/ui/skeleton'; 

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const { user, firestoreUser, loadingAuth, loadingFirestoreUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/login'); 
      return;
    }

    if (!loadingAuth && user && !loadingFirestoreUser) {
      if (firestoreUser === null && pathname !== '/login') {
        // This might indicate an issue with Firestore data not being created/fetched
        // Or user manually deleted their Firestore record. For robustness, redirect to login.
        console.warn("Authenticated user has no Firestore record. Redirecting to login.");
        // router.replace('/login'); // Or handle this specific error state
        return;
      }

      if (firestoreUser && !firestoreUser.onboardingCompleted && pathname !== '/onboarding') {
        router.replace('/onboarding');
      } else if (firestoreUser && firestoreUser.onboardingCompleted && pathname === '/onboarding') {
        router.replace('/dashboard');
      }
    }
  }, [user, firestoreUser, loadingAuth, loadingFirestoreUser, router, pathname]);

  if (loadingAuth || !user || loadingFirestoreUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  
  // If user is loaded, but firestoreUser is null (and not loading), and we are not already trying to onboard or login
  // This could be a state where signup happened but firestore save is pending or failed for some reason.
  // For now, if we reach here and onboarding is required but we are not on /onboarding, the effect above will redirect.
  // If onboarding is complete, or we are on the onboarding page, render the layout.
  if (firestoreUser && !firestoreUser.onboardingCompleted && pathname !== '/onboarding') {
    // This specific check ensures we don't flash content if redirection to /onboarding is pending.
    return (
         <div className="flex h-screen w-screen items-center justify-center">
            <p>Redirecionando para o onboarding...</p>
         </div>
    );
  }


  return (
    <AppProvider>
      <AppLayout>{children}</AppLayout>
    </AppProvider>
  );
}
