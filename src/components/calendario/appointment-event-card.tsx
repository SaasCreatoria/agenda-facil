
'use client';

import type { Agendamento, Servico, ConfiguracaoEmpresa } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, getHours, getMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface AppointmentEventCardProps {
  agendamento: Agendamento;
  servicos: Servico[];
  configuracao: ConfiguracaoEmpresa;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function AppointmentEventCard({
  agendamento,
  servicos,
  configuracao,
  onClick,
  className,
  style,
}: AppointmentEventCardProps) {
  const servico = servicos.find(s => s.id === agendamento.servicoId);
  const startTime = new Date(agendamento.dataHora);
  const endTime = new Date(startTime.getTime() + agendamento.duracaoMinutos * 60000);

  const formatEventTime = (date: Date) => format(date, 'HH:mm');

  return (
    <div
      className={cn(
        "rounded-md p-2 cursor-pointer shadow-md hover:shadow-lg transition-shadow overflow-hidden text-xs",
        className
      )}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      title={`${agendamento.clienteNome} - ${servico?.nome}\n${formatEventTime(startTime)} - ${formatEventTime(endTime)}`}
    >
      <p className="font-semibold truncate leading-tight">{agendamento.clienteNome || 'Cliente desconhecido'}</p>
      <p className="truncate leading-tight text-opacity-80">{servico?.nome || 'Serviço'}</p>
      <p className="text-[0.65rem] leading-tight text-opacity-70 flex items-center">
        <Clock size={10} className="mr-0.5 flex-shrink-0"/> 
        {formatEventTime(startTime)} - {formatEventTime(endTime)}
      </p>
    </div>
  );
}
