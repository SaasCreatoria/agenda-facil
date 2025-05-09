
'use client'; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ChevronRight, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context'; 

export default function HeroSection() {
  const { user, loadingAuth } = useAuth(); 

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl xl:text-7xl/none">
                Autonomia para os <span className="text-primary">profissionais</span>
              </h1>
              <p className="max-w-[650px] text-muted-foreground md:text-xl text-lg">
                Gerencie sua agenda, clientes e pagamentos de forma simples e inteligente. Mais tempo para você, mais satisfação para seus clientes.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              {!loadingAuth && (
                user ? (
                  <Button asChild size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                    <Link href="/dashboard">
                      Ir para o Painel
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                    <Link href="/signup">
                      Experimentar Grátis
                       <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    </Link>
                  </Button>
                )
              )}
               {loadingAuth && <div className="h-12 w-56 rounded-md bg-primary/50 animate-pulse" />}

              <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Link href="#pricing">
                  Ver planos e preços
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Junte-se a milhares de profissionais que já simplificaram sua rotina.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <Image
              src="https://picsum.photos/seed/professionals/1200/900"
              alt="Profissional usando o Agenda Fácil"
              width={600}
              height={450}
              className="relative mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full shadow-2xl"
              data-ai-hint="professional person"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

