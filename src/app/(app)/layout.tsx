
import AppLayout from '@/components/layout/app-layout';
import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/app-context';

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <AppLayout>{children}</AppLayout>
    </AppProvider>
  );
}
