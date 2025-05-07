
'use client'; // Needed for useAuth

import LandingHeader from '@/components/landing/landing-header';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import LandingFooter from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LandingPage() {
  const { user, loadingAuth } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        {/* Call to Action Section (Optional but good) */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter text-primary md:text-4xl/tight">
                Pronto para Organizar sua Agenda?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Comece a usar o Agenda Fácil hoje mesmo e veja como é simples gerenciar seus agendamentos e clientes.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              {!loadingAuth && (
                user ? (
                  <Button asChild size="lg" className="w-full group">
                    <Link href="/dashboard">
                      Acessar seu Painel
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="w-full group">
                    <Link href="/signup">
                      Crie sua Conta Grátis
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )
              )}
              {loadingAuth && <div className="h-11 w-full rounded-md bg-primary/50 animate-pulse" />}
              <p className="text-xs text-muted-foreground">
                {user ? 'Continue de onde parou.' : 'Sem necessidade de cartão de crédito. Comece em minutos.'}
              </p>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
