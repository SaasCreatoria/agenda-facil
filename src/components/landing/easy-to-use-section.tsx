
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, ChevronRight } from 'lucide-react';

export default function EasyToUseSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <Image
              src="https://picsum.photos/seed/appinterface/800/1000"
              alt="Interface do aplicativo Agenda Fácil"
              width={400}
              height={500}
              className="mx-auto aspect-[4/5] overflow-hidden rounded-xl object-cover object-top shadow-2xl border-4 border-background/20"
              data-ai-hint="mobile app schedule"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Não precisa entender nada de tecnologia.
            </h2>
            <p className="max-w-[600px] text-lg md:text-xl/relaxed">
              O Agenda Fácil é intuitivo e simples de usar. Nós cuidamos da complexidade para que você possa focar no seu trabalho, sem dores de cabeça com configurações complicadas.
            </p>
            <ul className="space-y-2 text-base md:text-lg">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-accent-foreground" />
                <span>Configuração rápida em poucos minutos.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-accent-foreground" />
                <span>Interface amigável para você e seus clientes.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-accent-foreground" />
                <span>Suporte dedicado para ajudar quando precisar.</span>
              </li>
            </ul>
            <Button asChild size="lg" variant="secondary" className="group text-lg px-8 py-3 bg-background text-primary hover:bg-muted">
              <Link href="/signup">
                Comece Agora
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
