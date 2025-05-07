
'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProfissionalList from '@/components/profissionais/profissional-list';
import ProfissionalForm from '@/components/profissionais/profissional-form';
import { useAppContext } from '@/contexts/app-context';
import type { Profissional, ProfissionalCreateDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfissionaisPage() {
  const { 
    profissionais, 
    loadingProfissionais, 
    createProfissional, 
    updateProfissional, 
    removeProfissional,
    servicos, 
    loadingServicos,
    getServicoById,
    agendamentos 
  } = useAppContext();
  
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | undefined>(undefined);

  const handleOpenForm = (profissional?: Profissional) => {
    setEditingProfissional(profissional);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProfissional(undefined);
    setIsFormOpen(false);
  };

  const handleSubmit = async (data: ProfissionalCreateDto | Profissional) => {
    let success = false;
    if (editingProfissional) {
      const originalHorarios = JSON.stringify(editingProfissional.horariosDisponiveis.sort((a,b) => a.diaSemana - b.diaSemana));
      const newHorarios = JSON.stringify((data as Profissional).horariosDisponiveis.sort((a,b) => a.diaSemana - b.diaSemana));

      if (originalHorarios !== newHorarios) {
        const hasFutureAppointments = agendamentos.some(a => 
            a.profissionalId === editingProfissional.id && 
            new Date(a.dataHora) > new Date() &&
            (a.status === 'PENDENTE' || a.status === 'CONFIRMADO')
        );
        if(hasFutureAppointments) {
            toast({
                title: "Disponibilidade Alterada",
                description: "A disponibilidade do profissional foi alterada. Verifique se há agendamentos futuros que precisam ser reagendados.",
                duration: 7000,
                variant: "default" // Use default or a warning variant
            });
        }
      }
      const result = await updateProfissional(editingProfissional.id, data as Partial<Omit<Profissional, 'id'>>);
      success = !!result;
    } else {
      const result = await createProfissional(data as ProfissionalCreateDto);
      success = !!result;
    }
    if (success) {
      handleCloseForm();
    }
  };

  const handleDeleteProfissional = async (profissionalId: string) => {
     const hasFutureAppointments = agendamentos.some(a => 
      a.profissionalId === profissionalId && 
      new Date(a.dataHora) > new Date() &&
      (a.status === 'PENDENTE' || a.status === 'CONFIRMADO')
    );

    if (hasFutureAppointments) {
      toast({
        variant: 'destructive',
        title: 'Não é possível excluir',
        description: 'Este profissional está vinculado a agendamentos futuros. Cancele ou reagende os agendamentos antes de excluir.',
        duration: 7000,
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este profissional?')) {
      await removeProfissional(profissionalId);
    }
  };
  
  const isLoading = loadingProfissionais || loadingServicos;

  return (
    <>
      <PageHeader 
        title="Profissionais" 
        description="Gerencie sua equipe de profissionais."
        actions={
          <Button onClick={() => handleOpenForm()} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Profissional
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>Visualize e gerencie todos os profissionais.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
          ) : (
            <ProfissionalList 
              profissionais={profissionais}
              onEdit={handleOpenForm}
              onDelete={handleDeleteProfissional}
              getServicoNome={(id) => getServicoById(id)?.nome}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto"> 
          <DialogHeader>
            <DialogTitle>{editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
          </DialogHeader>
          {isFormOpen && !isLoading && (
            <ProfissionalForm 
              initialData={editingProfissional}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              allServicos={servicos}
              existingProfissionais={profissionais}
            />
          )}
           {isLoading && isFormOpen && (
             <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <div className="flex justify-end space-x-2 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-36" />
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </>
  );
}
