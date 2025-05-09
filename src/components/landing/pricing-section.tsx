
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Básico',
    price: 'R$ 32',
    period: '/mês',
    features: [
      'Agenda Online Completa',
      'Cadastro de Clientes (até 100)',
      'Página Pública de Agendamento',
      'Lembretes por Email (Básico)',
    ],
    cta: 'Começar Agora',
    variant: 'outline',
    popular: false,
  },
  {
    name: 'Essencial',
    price: 'R$ 57',
    period: '/mês',
    features: [
      'Tudo do plano Básico',
      'Cadastro de Clientes Ilimitado',
      'Lembretes por Email Avançados',
      'Relatórios Simplificados',
      'Suporte Prioritário',
    ],
    cta: 'Escolher Essencial',
    variant: 'default',
    popular: true,
  },
  {
    name: 'Profissional',
    price: 'R$ 99',
    period: '/mês',
    features: [
      'Tudo do plano Essencial',
      'Múltiplos Profissionais',
      'Lembretes por WhatsApp (Z-API)',
      'Relatórios Detalhados',
      'API para Integrações (Em breve)',
    ],
    cta: 'Selecionar Profissional',
    variant: 'outline',
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
            Nossos Planos
          </div>
          <h2 className="text-2xl font-bold tracking-tighter text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
            Escolha o plano ideal para você
          </h2>
          <p className="max-w-[700px] text-base text-muted-foreground sm:text-lg md:text-xl/relaxed">
            Planos flexíveis que se adaptam ao crescimento do seu negócio. Sem taxas escondidas, cancele quando quiser.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <Card 
                key={plan.name} 
                className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${plan.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold text-primary-foreground">
                  MAIS POPULAR
                </div>
              )}
              <CardHeader className="pb-3 sm:pb-4 pt-6 sm:pt-8">
                <CardTitle className="text-xl sm:text-2xl text-primary">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                {/* <CardDescription> Add a short description here if needed </CardDescription> */}
              </CardHeader>
              <CardContent className="flex-grow space-y-2 sm:space-y-3">
                <ul className="space-y-1.5 sm:space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button asChild size="md" className="sm:size-lg w-full text-sm sm:text-base" variant={plan.variant as any}>
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          Tem dúvidas ou precisa de um plano personalizado? <Link href="/contato" className="underline hover:text-primary">Fale conosco</Link>.
        </p>
      </div>
    </section>
  );
}
