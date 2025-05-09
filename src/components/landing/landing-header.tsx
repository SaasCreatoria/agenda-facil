
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, CalendarDays } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context'; 
import UserNav from '@/components/auth/user-nav'; 

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Funcionalidades', href: '#features' }, // Assuming #features will exist or map to a relevant new section
  { label: 'Planos', href: '#pricing' },
  { label: 'Página Pública', href: '/publica' },
  { label: 'Contato', href: '/contato' }, // Placeholder, as /contato page doesn't exist yet
];

export default function LandingHeader() {
  const { theme, setTheme } = useTheme();
  const { user, loadingAuth } = useAuth(); 

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          <span className="font-bold sm:inline-block text-lg">Agenda Fácil</span>
        </Link>
        <nav className="hidden flex-1 gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-foreground/70 transition-colors hover:text-primary"
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
          
          {!loadingAuth && (
            user ? (
              <UserNav />
            ) : (
              <>
                <Button asChild className="hidden sm:inline-flex" variant="ghost">
                    <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/signup">Criar Conta Grátis</Link>
                </Button>
              </>
            )
          )}
          {loadingAuth && <div className="h-9 w-32 rounded-md bg-muted animate-pulse hidden sm:block" />}


          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col space-y-2 pt-8">
                {navItems.map((item) => (
                  <Button key={item.label} variant="ghost" className="justify-start text-base" asChild>
                    <Link href={item.href}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <hr className="my-3" />
                {!loadingAuth && (
                  user ? (
                     <Button asChild variant="default" className="w-full text-base py-3">
                      <Link href="/dashboard">Acessar Painel</Link>
                    </Button>
                  ) : (
                    <>
                    <Button asChild variant="outline" className="w-full text-base py-3">
                      <Link href="/login">Entrar</Link>
                    </Button>
                    <Button asChild variant="default" className="w-full text-base py-3">
                      <Link href="/signup">Criar Conta Grátis</Link>
                    </Button>
                    </>
                  )
                )}
                {loadingAuth && <div className="h-11 w-full rounded-md bg-muted animate-pulse" />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

