'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AgendaList from '@/components/agendamentos/agenda-list';
import AgendaForm from '@/components/agendamentos/agenda-form';
import { useAppContext } from '@/contexts/app-context';
import type { Agendamento, AgendamentoCreateDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function AgendamentosPage() {
  const { 
    agendamentos, 
    loadingAgendamentos, 
    createAgendamento, 
    updateAgendamento, 
    // removeAgendamento, // Not using hard delete in this version
    servicos,
    loadingServicos,
    profissionais,
    loadingProfissionais,
    clientes,
    loadingClientes,
  } = useAppContext();
  
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | undefined>(undefined);

  const handleOpenForm = (agendamento?: Agendamento) => {
    setEditingAgendamento(agendamento);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingAgendamento(undefined);
    setIsFormOpen(false);
  };

  const handleSubmit = async (data: AgendamentoCreateDto | Agendamento) => {
    let success = false;
    if (editingAgendamento) {
      const result = await updateAgendamento(editingAgendamento.id, data as Partial<Omit<Agendamento, 'id' | 'criadoEm'>>);
      success = !!result;
    } else {
      const result = await createAgendamento(data as AgendamentoCreateDto);
      success = !!result;
    }
    if (success) {
      handleCloseForm();
    }
  };

  const handleCancelAgendamento = async (agendamento: Agendamento) => {
    if(agendamento.status === 'CONCLUIDO'){
        toast({title: 'Ação não permitida', description: 'Não é possível cancelar um agendamento já concluído.', variant: 'destructive'})
        return;
    }
    if(agendamento.status === 'CANCELADO'){
        toast({title: 'Agendamento já cancelado', description: 'Este agendamento já está cancelado.', variant: 'default'})
        return;
    }

    const result = await updateAgendamento(agendamento.id, { status: 'CANCELADO' });
    if(result) {
        toast({ title: 'Agendamento Cancelado', description: 'O status do agendamento foi alterado para cancelado.'})
    }
  };
  
  const isLoading = loadingAgendamentos || loadingServicos || loadingProfissionais || loadingClientes;


  return (
    <>
      <PageHeader 
        title="Agendamentos" 
        description="Gerencie seus agendamentos."
        actions={
          <Button onClick={() => handleOpenForm()} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>Filtre e visualize todos os agendamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <AgendaList 
              agendamentos={agendamentos}
              onEdit={handleOpenForm}
              onCancel={handleCancelAgendamento}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          </DialogHeader>
          {isFormOpen && !isLoading && ( // Ensure data is loaded before rendering form
            <AgendaForm 
              initialData={editingAgendamento}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              servicos={servicos}
              profissionais={profissionais}
              clientes={clientes}
            />
          )}
           {isLoading && isFormOpen && ( // Show skeleton if form is open but dependent data is loading
             <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end space-x-2 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </>
  );
}