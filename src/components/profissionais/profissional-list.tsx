'use client';

import type { Profissional } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Phone, Mail } from 'lucide-react';

interface ProfissionalListProps {
  profissionais: Profissional[];
  onEdit: (profissional: Profissional) => void;
  onDelete: (profissionalId: string) => void;
  getServicoNome: (servicoId: string) => string | undefined;
}

export default function ProfissionalList({ profissionais, onEdit, onDelete, getServicoNome }: ProfissionalListProps) {
  if (!profissionais || profissionais.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum profissional cadastrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profissionais.map((profissional) => (
        <Card key={profissional.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle>{profissional.nome}</CardTitle>
                <Badge variant={profissional.ativo ? 'default' : 'outline'}>
                    {profissional.ativo ? 'Inativo' : 'Inativo'}
                </Badge>
            </div>
            <CardDescription className="mt-1 space-y-1">
              {profissional.email && <span className="flex items-center text-xs"><Mail className="mr-1.5 h-3 w-3 text-muted-foreground" /> {profissional.email}</span>}
              {profissional.telefone && <span className="flex items-center text-xs"><Phone className="mr-1.5 h-3 w-3 text-muted-foreground" /> {profissional.telefone}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-2">
            <div>
                <h4 className="font-semibold text-sm mb-1">Serviços Oferecidos:</h4>
                {profissional.servicosIds && profissional.servicosIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                    {profissional.servicosIds.map(id => (
                        <Badge key={id} variant="secondary" className="text-xs">
                            {getServicoNome(id) || id}
                        </Badge>
                    ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">Nenhum serviço vinculado.</p>
                )}
            </div>
            {/* TODO: Display HorariosDisponiveis in a readable format */}
             {/* <div>
                <h4 className="font-semibold text-sm mb-1">Disponibilidade:</h4>
                <p className="text-xs text-muted-foreground"> (Visualização da disponibilidade aqui)</p>
            </div> */}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(profissional)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(profissional.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}