
'use client';

import type { Lembrete, Agendamento } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils/helpers';
import { Send, Eye, AlertTriangle, Pencil } from 'lucide-react';

interface LembreteTableProps {
  lembretes: Lembrete[];
  agendamentos: Agendamento[]; // To get agendamento details
  onResend: (lembrete: Lembrete) => void;
  onViewDetails: (lembrete: Lembrete, agendamento?: Agendamento) => void;
  onEdit: (lembrete: Lembrete) => void; // Added for editing
}

export default function LembreteTable({ lembretes, agendamentos, onResend, onViewDetails, onEdit }: LembreteTableProps) {
  
  const getAgendamentoForLembrete = (agendamentoId: string): Agendamento | undefined => {
    return agendamentos.find(a => a.id === agendamentoId);
  };

  const getStatusVariant = (status: Lembrete['status']) => {
    switch (status) {
      case 'PENDENTE':
        return 'secondary';
      case 'ENVIADO':
        return 'default'; 
      case 'FALHOU':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!lembretes || lembretes.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum lembrete encontrado.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agendamento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Envio Agendado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lembretes.map((lembrete) => {
            const agendamento = getAgendamentoForLembrete(lembrete.agendamentoId);
            return (
              <TableRow key={lembrete.id}>
                <TableCell>
                  {agendamento ? (
                    <>
                      {agendamento.servicoNome || 'Serviço Indisponível'}
                      <div className="text-xs text-muted-foreground">{formatDateTime(agendamento.dataHora)}</div>
                    </>
                  ) : (
                    <span className="text-destructive flex items-center text-xs"><AlertTriangle className="h-3 w-3 mr-1"/> Agendamento não encontrado</span>
                  )}
                </TableCell>
                 <TableCell>{agendamento?.clienteNome || 'N/A'}</TableCell>
                <TableCell>{formatDateTime(lembrete.dataEnvioAgendado)}</TableCell>
                <TableCell>
                    <Badge variant="outline" className="text-xs">{lembrete.tipo}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(lembrete.status)} className="text-xs">
                    {lembrete.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => onViewDetails(lembrete, agendamento)} title="Ver Detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(lembrete)} title="Editar Lembrete">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {lembrete.status !== 'ENVIADO' && ( 
                     <Button variant="outline" size="icon" onClick={() => onResend(lembrete)} title="Reenviar Lembrete">
                        <Send className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
