
import AppLayout from '@/components/layout/app-layout';
import type { ReactNode } from 'react';

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  // Here you might add authentication checks in a real app
  return <AppLayout>{children}</AppLayout>;
}
