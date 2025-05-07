
import PageHeader from '@/components/shared/page-header';
import MetricCard from '@/components/dashboard/metric-card';
import RevenueChart from '@/components/charts/revenue-chart';
import { CalendarClock, DollarSign, BellRing } from 'lucide-react';

export default function DashboardPage() {
  // Placeholder data - replace with actual data from LocalStorage in later steps
  const upcomingAppointments = 5;
  const monthlyRevenue = "R$ 1.250,00";
  const pendingReminders = 3;

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral do seu negócio." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <MetricCard 
          title="Próximos 7 Dias" 
          value={upcomingAppointments} 
          icon={CalendarClock}
          description="Agendamentos confirmados"
        />
        <MetricCard 
          title="Receita do Mês" 
          value={monthlyRevenue} 
          icon={DollarSign}
          description="Estimativa baseada em serviços concluídos"
        />
        <MetricCard 
          title="Lembretes Pendentes" 
          value={pendingReminders} 
          icon={BellRing}
          description="Lembretes a serem enviados"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueChart />
        {/* Potentially other charts or summaries */}
      </div>
    </>
  );
}
