'use client';

import { useMemo } from 'react';
import PageHeader from '@/components/shared/page-header';
import MetricCard from '@/components/dashboard/metric-card';
import RevenueChart from '@/components/charts/revenue-chart'; 
import { CalendarClock, DollarSign, BellRing, Users, Briefcase } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { maskCurrency } from '@/utils/helpers';

export default function DashboardPage() {
  const { 
    agendamentos, 
    loadingAgendamentos, 
    lembretes, 
    loadingLembretes,
    servicos,
    loadingServicos,
    clientes,
    loadingClientes
  } = useAppContext();

  const isLoading = loadingAgendamentos || loadingLembretes || loadingServicos || loadingClientes;

  const upcomingAppointments = useMemo(() => {
    if (isLoading) return 0;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return agendamentos.filter(a => {
      const apptDate = new Date(a.dataHora);
      return apptDate >= now && apptDate <= sevenDaysFromNow && (a.status === 'CONFIRMADO' || a.status === 'PENDENTE');
    }).length;
  }, [agendamentos, isLoading]);

  const monthlyRevenue = useMemo(() => {
    if (isLoading) return "R$ 0,00";
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const revenue = agendamentos
      .filter(a => {
        const apptDate = new Date(a.dataHora);
        return a.status === 'CONCLUIDO' && apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
      })
      .reduce((total, a) => {
        const servico = servicos.find(s => s.id === a.servicoId);
        return total + (servico?.preco || 0);
      }, 0);
    return maskCurrency(revenue);
  }, [agendamentos, servicos, isLoading]);

  const pendingReminders = useMemo(() => {
    if (isLoading) return 0;
    return lembretes.filter(l => l.status === 'PENDENTE').length;
  }, [lembretes, isLoading]);

  const totalClientes = useMemo(() => {
    if (isLoading) return 0;
    return clientes.length;
  }, [clientes, isLoading]);

  const totalServicosAtivos = useMemo(() => {
    if (isLoading) return 0;
    return servicos.filter(s => s.ativo).length;
  }, [servicos, isLoading]);


  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Visão geral do seu negócio." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-[350px] w-full" />
        </div>
      </>
    );
  }


  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral do seu negócio." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <MetricCard 
          title="Próximos 7 Dias" 
          value={upcomingAppointments} 
          icon={CalendarClock}
          description="Agendamentos confirmados/pendentes"
        />
        <MetricCard 
          title="Receita do Mês" 
          value={monthlyRevenue} 
          icon={DollarSign}
          description="Baseado em serviços concluídos"
        />
        <MetricCard 
          title="Lembretes Pendentes" 
          value={pendingReminders} 
          icon={BellRing}
          description="Lembretes a serem enviados"
        />
         <MetricCard 
          title="Total de Clientes" 
          value={totalClientes} 
          icon={Users}
          description="Clientes cadastrados"
        />
        <MetricCard 
          title="Serviços Ativos" 
          value={totalServicosAtivos} 
          icon={Briefcase}
          description="Serviços oferecidos"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueChart agendamentos={agendamentos} servicos={servicos} />
      </div>
    </>
  );
}