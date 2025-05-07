'use client';

import type { Agendamento } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils/helpers';
import { Pencil, Trash2, Ban } from 'lucide-react'; // Ban for Cancel

interface AgendaListProps {
  agendamentos: Agendamento[];
  onEdit: (agendamento: Agendamento) => void;
  onCancel: (agendamento: Agendamento) => void; // To change status to CANCELADO
  onDelete?: (agendamentoId: string) => void; // Optional: for hard delete if needed
}

export default function AgendaList({ agendamentos, onEdit, onCancel, onDelete }: AgendaListProps) {
  const getStatusVariant = (status: Agendamento['status']) => {
    switch (status) {
      case 'PENDENTE':
        return 'secondary';
      case 'CONFIRMADO':
        return 'default';
      case 'CONCLUIDO':
        return 'outline'; // Or a success variant if you add one
      case 'CANCELADO':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!agendamentos || agendamentos.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum agendamento encontrado.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agendamentos.map((agendamento) => (
            <TableRow key={agendamento.id}>
              <TableCell>{formatDateTime(agendamento.dataHora)}</TableCell>
              <TableCell>{agendamento.clienteNome || agendamento.clienteId}</TableCell>
              <TableCell>{agendamento.servicoNome || agendamento.servicoId}</TableCell>
              <TableCell>{agendamento.profissionalNome || agendamento.profissionalId}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(agendamento.status)}>
                  {agendamento.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(agendamento)} title="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                {agendamento.status !== 'CANCELADO' && agendamento.status !== 'CONCLUIDO' && (
                  <Button variant="outline" size="icon" onClick={() => onCancel(agendamento)} title="Cancelar Agendamento">
                    <Ban className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && ( // Render delete button only if onDelete is provided
                   <Button variant="destructive" size="icon" onClick={() => onDelete(agendamento.id)} title="Excluir Permanentemente">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}