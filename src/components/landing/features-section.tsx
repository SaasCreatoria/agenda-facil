import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Users, BellRing, Globe, Settings, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Agendamento Online Fácil',
    description: 'Permita que seus clientes agendem horários online 24/7 através de uma página pública personalizada.',
    dataAiHint: "calendar schedule",
  },
  {
    icon: Users,
    title: 'Gestão de Clientes (CRM)',
    description: 'Mantenha um cadastro completo de seus clientes, com histórico e preferências.',
    dataAiHint: "customer list",
  },
  {
    icon: BellRing,
    title: 'Lembretes Automáticos',
    description: 'Reduza no-shows com lembretes automáticos por email para seus clientes.',
    dataAiHint: "notification bell",
  },
  {
    icon: Globe,
    title: 'Página Pública Personalizável',
    description: 'Crie uma vitrine online para seus serviços, com sua marca e informações.',
    dataAiHint: "website interface",
  },
  {
    icon: Settings,
    title: 'Gerenciamento de Serviços',
    description: 'Cadastre e organize todos os serviços que você oferece, com preços e durações.',
    dataAiHint: "service settings",
  },
  {
    icon: BarChart3,
    title: 'Dashboard Intuitivo',
    description: 'Acompanhe métricas importantes do seu negócio, como receita e próximos agendamentos.',
    dataAiHint: "analytics dashboard",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Recursos Principais
            </div>
            <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-5xl">
              Tudo que Você Precisa para Gerenciar Agendamentos
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Desde o agendamento online até o acompanhamento pós-serviço, Agenda Fácil oferece as ferramentas para otimizar seu tempo e encantar seus clientes.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
