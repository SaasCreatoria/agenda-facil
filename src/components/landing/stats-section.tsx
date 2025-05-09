
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase } from 'lucide-react';

const stats = [
  {
    value: '+200 mil',
    label: 'Agendamentos Realizados',
    icon: TrendingUp,
  },
  {
    value: '+10 mil',
    label: 'Negócios Impulsionados',
    icon: Briefcase,
  },
  {
    value: '+100 mil',
    label: 'Usuários Ativos',
    icon: Users,
  },
];

export default function StatsSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="flex flex-col items-center justify-center p-4 sm:p-6 text-center shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <stat.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3" />
              <div className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
