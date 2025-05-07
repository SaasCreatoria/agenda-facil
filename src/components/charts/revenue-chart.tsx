"use client"

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { Agendamento, Servico } from '@/types';

interface RevenueChartProps {
  agendamentos: Agendamento[];
  servicos: Servico[];
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export default function RevenueChart({ agendamentos, servicos }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const dataByMonth: { [key: string]: number } = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
        dataByMonth[monthKey] = 0;
    }

    agendamentos.forEach(ag => {
      if (ag.status === 'CONCLUIDO') {
        const servico = servicos.find(s => s.id === ag.servicoId);
        if (servico) {
          const date = new Date(ag.dataHora);
          const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
          if (dataByMonth.hasOwnProperty(monthKey)) { 
             dataByMonth[monthKey] = (dataByMonth[monthKey] || 0) + servico.preco;
          }
        }
      }
    });
    
    return Object.entries(dataByMonth).map(([month, revenue]) => ({ month, revenue }));

  }, [agendamentos, servicos]);
  
  if (!agendamentos || !servicos || agendamentos.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>Receita dos últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">{!agendamentos || !servicos ? "Carregando dados..." : "Sem dados de receita para exibir."}</p>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Mensal</CardTitle>
        <CardDescription>Receita dos últimos 6 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis 
                tickFormatter={(value) => `R$${value / 1000}k`}
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                fontSize={12}
                width={50} 
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend wrapperStyle={{fontSize: "12px"}}/>
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}