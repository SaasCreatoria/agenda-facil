import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/app-context';

export default function PublicLayout({ children }: { children: ReactNode }) {
  // This layout ensures AppProvider is available for the public booking page
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
