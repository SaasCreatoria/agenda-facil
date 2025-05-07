'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ServicoList from '@/components/servicos/servico-list';
import ServicoForm from '@/components/servicos/servico-form';
import { useAppContext } from '@/contexts/app-context';
import type { Servico, ServicoCreateDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicosPage() {
  const { 
    servicos, 
    loadingServicos, 
    createServico, 
    updateServico, 
    removeServico,
    agendamentos // For checking future appointments before deletion
  } = useAppContext();
  
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | undefined>(undefined);

  const handleOpenForm = (servico?: Servico) => {
    setEditingServico(servico);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingServico(undefined);
    setIsFormOpen(false);
  };

  const handleSubmit = async (data: ServicoCreateDto | Servico) => {
    let success = false;
    if (editingServico) {
      const result = await updateServico(editingServico.id, data as Partial<Omit<Servico, 'id'>>);
      success = !!result;
    } else {
      const result = await createServico(data as ServicoCreateDto);
      success = !!result;
    }
    if (success) {
      handleCloseForm();
    }
  };

  const handleDeleteServico = async (servicoId: string) => {
    const hasFutureAppointments = agendamentos.some(a => 
      a.servicoId === servicoId && 
      new Date(a.dataHora) > new Date() &&
      a.status !== 'CANCELADO' && a.status !== 'CONCLUIDO'
    );

    if (hasFutureAppointments) {
      toast({
        variant: 'destructive',
        title: 'Não é possível excluir',
        description: 'Este serviço está vinculado a agendamentos futuros. Cancele ou reagende os agendamentos antes de excluir o serviço.',
        duration: 7000,
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await removeServico(servicoId);
    }
  };

  return (
    <>
      <PageHeader 
        title="Serviços" 
        description="Gerencie os serviços oferecidos."
        actions={
          <Button onClick={() => handleOpenForm()} disabled={loadingServicos}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
          </Button>
        }
      />
       <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Visualize e gerencie todos os serviços.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingServicos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <ServicoList 
              servicos={servicos}
              onEdit={handleOpenForm}
              onDelete={handleDeleteServico}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>
          {isFormOpen && ( // Render form only when dialog is open
            <ServicoForm 
              initialData={editingServico}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}