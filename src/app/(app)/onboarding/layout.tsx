import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/app-context';

// This layout ensures AppProvider is available for the onboarding page,
// but it does NOT include the main AppLayout (sidebar, header)
// as onboarding is a distinct fullscreen flow. AuthProvider is handled by RootLayout.
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
        {children}
    </AppProvider>
  );
}
