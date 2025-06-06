
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users2, Settings, BarChartHorizontalBig } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    description: 'Organize seus horários com facilidade, evite conflitos e acesse de qualquer lugar.',
  },
  {
    icon: Users2,
    title: 'Gestão de Clientes',
    description: 'Mantenha o cadastro de clientes atualizado, com histórico e preferências.',
  },
  {
    icon: Settings,
    title: 'Controle Total',
    description: 'Personalize serviços, horários de atendimento e muito mais, tudo na sua mão.',
  },
];

export default function TimeSavingSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Otimize seu Negócio
            </div>
            <h2 className="text-2xl font-bold tracking-tighter text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              Para economizar seu tempo (e o dos seus clientes!)
            </h2>
            <p className="max-w-[600px] text-base text-muted-foreground sm:text-lg md:text-xl/relaxed">
              Nossa plataforma foi desenhada para simplificar sua rotina, automatizar tarefas e liberar você para focar no que realmente importa: seu talento e seus clientes.
            </p>
            <div className="grid gap-4 mt-6">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 pb-2">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-md">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <CardTitle className="text-md sm:text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-8 lg:mt-0">
            <Image
              src="https://picsum.photos/seed/teamwork/800/1000"
              alt="Equipe economizando tempo"
              width={500}
              height={625}
              className="mx-auto aspect-[4/5] overflow-hidden rounded-xl object-cover object-center shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md"
              data-ai-hint="business team"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
