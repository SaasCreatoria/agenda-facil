'use client';

import type { Servico } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { maskCurrency } from '@/utils/helpers';

interface ServicoListProps {
  servicos: Servico[];
  onEdit: (servico: Servico) => void;
  onDelete: (servicoId: string) => void;
}

export default function ServicoList({ servicos, onEdit, onDelete }: ServicoListProps) {
  if (!servicos || servicos.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum serviço cadastrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servicos.map((servico) => (
        <Card key={servico.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{servico.nome}</CardTitle>
              <Badge variant={servico.ativo ? 'default' : 'outline'}>
                {servico.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            {servico.descricao && <CardDescription className="mt-1 line-clamp-2">{servico.descricao}</CardDescription>}
          </CardHeader>
          <CardContent className="flex-grow space-y-2">
            <p><span className="font-semibold">Preço:</span> {maskCurrency(servico.preco)}</p>
            <p><span className="font-semibold">Duração:</span> {servico.duracaoMinutos} minutos</p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(servico)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(servico.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}