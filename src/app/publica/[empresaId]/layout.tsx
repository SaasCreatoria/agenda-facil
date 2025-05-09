import type { ReactNode } from 'react';
// AppProvider might not be strictly necessary if all data is fetched directly,
// but keeping it for now in case some sub-components or future hooks rely on it (e.g., useToast).
import { AppProvider } from '@/contexts/app-context'; 

export default function PublicEmpresaLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
