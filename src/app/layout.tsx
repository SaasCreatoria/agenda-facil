import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ThemeProviderClient from '@/components/providers/theme-provider-client';
// AppProvider is removed from here and will be added to specific layouts

export const metadata: Metadata = {
  title: 'Agenda Fácil',
  description: 'Gerenciamento fácil de agendamentos e landing page da plataforma.',
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
          {children}
          <Toaster />
        </ThemeProviderClient>
      </body>
    </html>
  );
}
