
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, CalendarDays } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import UserNav from '@/components/auth/user-nav'; // Import UserNav

const navItems = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Página Pública', href: '/publica' },
];

export default function LandingHeader() {
  const { theme, setTheme } = useTheme();
  const { user, loadingAuth } = useAuth(); // Get user and loading state

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">Agenda Fácil</span>
        </Link>
        <nav className="hidden flex-1 gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? "Mudar para tema escuro" : "Mudar para tema claro"}
          >
            {theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          {/* Conditional rendering for UserNav or Login button */}
          {!loadingAuth && (
            user ? (
              <UserNav />
            ) : (
              <Button asChild className="hidden sm:inline-flex" variant="outline">
                <Link href="/login">Acessar Painel</Link>
              </Button>
            )
          )}
          {loadingAuth && <div className="h-8 w-20 rounded-md bg-muted animate-pulse hidden sm:block" />}


          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 pt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                {!loadingAuth && (
                  user ? (
                    <Button asChild variant="default" className="w-full">
                      <Link href="/dashboard">Acessar Painel</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Entrar / Registrar</Link>
                    </Button>
                  )
                )}
                {loadingAuth && <div className="h-10 w-full rounded-md bg-muted animate-pulse" />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
