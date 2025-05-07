'use client';

import type { Cliente } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Phone, Mail, Gift } from 'lucide-react'; // Gift for birthday
import { formatDate, maskPhoneNumber } from '@/utils/helpers';

interface ClienteListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (clienteId: string) => void;
}

export default function ClienteList({ clientes, onEdit, onDelete }: ClienteListProps) {
  if (!clientes || clientes.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum cliente cadastrado.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Data de Nascimento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1.5 h-4 w-4" /> {maskPhoneNumber(cliente.telefone)}
                </div>
                {cliente.email && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Mail className="mr-1.5 h-4 w-4" /> {cliente.email}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {cliente.dataNascimento ? (
                  <div className="flex items-center text-sm">
                    <Gift className="mr-1.5 h-4 w-4 text-muted-foreground" /> {formatDate(cliente.dataNascimento, { year: undefined, month:'2-digit', day: '2-digit' })}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Não informado</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(cliente)} title="Editar Cliente">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(cliente.id)} title="Excluir Cliente">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}