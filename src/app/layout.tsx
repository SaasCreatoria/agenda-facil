import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ThemeProviderClient from '@/components/providers/theme-provider-client';
import { AppProvider } from '@/contexts/app-context'; // Import AppProvider

export const metadata: Metadata = {
  title: 'Agenda Fácil',
  description: 'Gerenciamento fácil de agendamentos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProviderClient
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider> {/* Wrap with AppProvider */}
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProviderClient>
      </body>
    </html>
  );
}