
'use client';

import type { Agendamento, Servico, ConfiguracaoEmpresa, AgendamentoStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, getHours, getMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, AlertCircle, CalendarClock } from 'lucide-react';

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

  const getStatusStyles = (status: AgendamentoStatus) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'bg-green-600/80 hover:bg-green-600/90 text-primary-foreground line-through opacity-80';
      case 'CANCELADO':
        return 'bg-destructive/70 hover:bg-destructive/80 text-destructive-foreground line-through opacity-70';
      case 'CONFIRMADO':
        return 'bg-blue-600/90 hover:bg-blue-600 text-primary-foreground';
      case 'PENDENTE':
      default:
        return 'bg-amber-500/90 hover:bg-amber-500 text-primary-foreground';
    }
  };
  
  const getStatusBadgeVariant = (status: AgendamentoStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'CONCLUIDO': return 'default'; // Assuming default is green-ish or primary
        case 'CANCELADO': return 'destructive';
        case 'CONFIRMADO': return 'default'; // Consider a specific 'success' or 'info' variant
        case 'PENDENTE': return 'secondary';
        default: return 'outline';
    }
  }

  const StatusIcon = ({ status }: { status: AgendamentoStatus }) => {
    switch (status) {
      case 'CONCLUIDO': return <CheckCircle size={10} className="mr-0.5 flex-shrink-0"/>;
      case 'CANCELADO': return <XCircle size={10} className="mr-0.5 flex-shrink-0"/>;
      case 'CONFIRMADO': return <CalendarClock size={10} className="mr-0.5 flex-shrink-0"/>;
      case 'PENDENTE': return <AlertCircle size={10} className="mr-0.5 flex-shrink-0"/>;
      default: return null;
    }
  };


  return (
    <div
      className={cn(
        "rounded-md p-1.5 cursor-pointer shadow-md hover:shadow-lg transition-shadow overflow-hidden text-xs",
        getStatusStyles(agendamento.status),
        className
      )}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      title={`${agendamento.clienteNome} - ${servico?.nome}\n${formatEventTime(startTime)} - ${formatEventTime(endTime)}\nStatus: ${agendamento.status}`}
    >
      <p className="font-semibold truncate leading-tight">{agendamento.clienteNome || 'Cliente desconhecido'}</p>
      <p className="truncate leading-tight text-opacity-80">{servico?.nome || 'Serviço'}</p>
      <div className="flex justify-between items-center text-[0.65rem] leading-tight text-opacity-70">
        <span className="flex items-center">
          <Clock size={10} className="mr-0.5 flex-shrink-0"/> 
          {formatEventTime(startTime)} - {formatEventTime(endTime)}
        </span>
        <Badge 
            variant={getStatusBadgeVariant(agendamento.status)} 
            className={cn(
                "px-1 py-0 text-[0.6rem] h-4 font-normal",
                 agendamento.status === 'CANCELADO' && "bg-red-200 text-red-800 border-red-300",
                 agendamento.status === 'CONCLUIDO' && "bg-green-200 text-green-800 border-green-300",
                 agendamento.status === 'CONFIRMADO' && "bg-blue-200 text-blue-800 border-blue-300",
                 agendamento.status === 'PENDENTE' && "bg-yellow-200 text-yellow-800 border-yellow-300"
            )}
        >
          <StatusIcon status={agendamento.status} />
          {agendamento.status.substring(0,3)}
        </Badge>
      </div>
    </div>
  );
}
