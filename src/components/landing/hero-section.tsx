
'use client'; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ChevronRight, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context'; 

export default function HeroSection() {
  const { user, loadingAuth } = useAuth(); 

  return (
    <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl/none">
                Autonomia para os <span className="text-primary">profissionais</span>
              </h1>
              <p className="max-w-[650px] text-muted-foreground text-base sm:text-lg md:text-xl">
                Gerencie sua agenda, clientes e pagamentos de forma simples e inteligente. Mais tempo para você, mais satisfação para seus clientes.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              {!loadingAuth && (
                user ? (
                  <Button asChild size="md" className="sm:size-lg group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 sm:px-8 sm:py-3 text-base sm:text-lg">
                    <Link href="/dashboard">
                      Ir para o Painel
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="md" className="sm:size-lg group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 sm:px-8 sm:py-3 text-base sm:text-lg">
                    <Link href="/signup">
                      Experimentar Grátis
                       <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    </Link>
                  </Button>
                )
              )}
               {loadingAuth && <div className="h-11 sm:h-12 w-48 sm:w-56 rounded-md bg-primary/50 animate-pulse" />}

              <Button asChild variant="outline" size="md" className="sm:size-lg px-6 py-2.5 sm:px-8 sm:py-3 text-base sm:text-lg">
                <Link href="#pricing">
                  Ver planos e preços
                </Link>
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Junte-se a milhares de profissionais que já simplificaram sua rotina.
            </p>
          </div>
          <div className="relative group mt-8 lg:mt-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <Image
              src="https://picsum.photos/seed/professionals/1200/900"
              alt="Profissional usando o Agenda Fácil"
              width={600}
              height={450}
              className="relative mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center w-full shadow-2xl"
              data-ai-hint="professional person"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
