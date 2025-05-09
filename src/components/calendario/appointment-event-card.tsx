
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
        return 'bg-muted text-muted-foreground line-through opacity-70 hover:opacity-80';
      case 'CANCELADO':
        return 'bg-destructive/30 text-destructive-foreground line-through opacity-70 hover:opacity-80 hover:bg-destructive/40';
      case 'CONFIRMADO':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'PENDENTE':
      default:
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
    }
  };
  
  const getStatusBadgeVariant = (status: AgendamentoStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'CONCLUIDO': return 'outline'; 
        case 'CANCELADO': return 'destructive';
        case 'CONFIRMADO': return 'default'; 
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
      <p className="truncate leading-tight opacity-80">{servico?.nome || 'Serviço'}</p>
      <div className="flex justify-between items-center text-[0.65rem] leading-tight opacity-90">
        <span className="flex items-center">
          <Clock size={10} className="mr-0.5 flex-shrink-0"/> 
          {formatEventTime(startTime)} - {formatEventTime(endTime)}
        </span>
        <Badge 
            variant={getStatusBadgeVariant(agendamento.status)} 
            className="px-1 py-0 text-[0.6rem] h-4 font-normal" // Removed custom bg/text/border classes
        >
          <StatusIcon status={agendamento.status} />
          {agendamento.status.substring(0,3).toUpperCase()}
        </Badge>
      </div>
    </div>
  );
}

