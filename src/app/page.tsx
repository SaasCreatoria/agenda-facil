
'use client'; 

import LandingHeader from '@/components/landing/landing-header';
import HeroSection from '@/components/landing/hero-section';
import StatsSection from '@/components/landing/stats-section';
import TimeSavingSection from '@/components/landing/time-saving-section';
import SegmentsSection from '@/components/landing/segments-section';
import EasyToUseSection from '@/components/landing/easy-to-use-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import PricingSection from '@/components/landing/pricing-section';
import LandingFooter from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LandingPage() {
  const { user, loadingAuth } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <TimeSavingSection />
        <SegmentsSection />
        <EasyToUseSection />
        <TestimonialsSection />
        <PricingSection />
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter text-primary md:text-4xl/tight">
                Transforme sua Gestão Agora Mesmo!
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Descubra como o Agenda Fácil pode revolucionar a organização do seu negócio. Teste gratuitamente e veja a diferença.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              {!loadingAuth && (
                user ? (
                  <Button asChild size="lg" className="w-full group bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/dashboard">
                      Acessar seu Painel
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="w-full group bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/signup">
                      Experimentar Grátis
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )
              )}
              {loadingAuth && <div className="h-11 w-full rounded-md bg-primary/50 animate-pulse" />}
              <p className="text-xs text-muted-foreground">
                {user ? 'Continue de onde parou.' : 'Comece em minutos. Sem necessidade de cartão de crédito.'}
              </p>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

