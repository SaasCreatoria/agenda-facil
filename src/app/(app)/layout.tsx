
'use client'; // Required for hooks like useAuth and useRouter

import AppLayout from '@/components/layout/app-layout';
import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter
import { useEffect } from 'react'; // Import useEffect
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [user, loadingAuth, router]);

  if (loadingAuth || !user) {
    // Show a loading skeleton or a full-page loader while checking auth or redirecting
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

  // User is authenticated, render the app layout
  return (
    <AppProvider>
      <AppLayout>{children}</AppLayout>
    </AppProvider>
  );
}
