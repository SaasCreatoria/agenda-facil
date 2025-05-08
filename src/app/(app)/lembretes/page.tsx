
'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LembreteTable from '@/components/lembretes/lembrete-table';
import LembreteForm from '@/components/lembretes/lembrete-form'; // Import LembreteForm
import { useAppContext } from '@/contexts/app-context';
import type { Lembrete, Agendamento, LembreteUpdateDto } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from '@/utils/helpers';

export default function LembretesPage() {
  const { 
    lembretes, 
    loadingLembretes,
    agendamentos, 
    loadingAgendamentos,
    sendReminder,
    updateLembrete, // Added from context
  } = useAppContext();
  
  const { toast } = useToast();
  const [selectedLembrete, setSelectedLembrete] = useState<{lembrete: Lembrete, agendamento?: Agendamento} | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [editingLembrete, setEditingLembrete] = useState<Lembrete | undefined>(undefined); // Lembrete being edited

  const handleResendLembrete = async (lembrete: Lembrete) => {
    // No need to check for ENVIADO status here, sendReminder handles it if called on an already sent one.
    // It's good UX to allow resending a failed one, or even a successfully sent one if user wishes.
    await sendReminder(lembrete); 
  };

  const handleViewDetails = (lembrete: Lembrete, agendamento?: Agendamento) => {
    setSelectedLembrete({lembrete, agendamento});
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (lembrete: Lembrete) => {
    setEditingLembrete(lembrete);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingLembrete(undefined);
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (data: LembreteUpdateDto) => {
    if (editingLembrete) {
      const result = await updateLembrete(editingLembrete.id, data);
      if (result) {
        handleCloseEditModal();
      }
    }
  };
  
  const isLoading = loadingLembretes || loadingAgendamentos;

  return (
    <>
      <PageHeader 
        title="Lembretes" 
        description="Revise e gerencie os lembretes agendados."
      />
      <Card>
        <CardHeader>
          <CardTitle>Lembretes Agendados</CardTitle>
          <CardDescription>Visualize o status dos lembretes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <LembreteTable 
              lembretes={lembretes}
              agendamentos={agendamentos}
              onResend={handleResendLembrete}
              onViewDetails={handleViewDetails}
              onEdit={handleOpenEditModal} // Pass edit handler
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLembrete && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalhes do Lembrete</DialogTitle>
                    <DialogDescription>
                        Informações sobre o lembrete e agendamento associado.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2 text-sm">
                    <p><strong>ID do Lembrete:</strong> {selectedLembrete.lembrete.id}</p>
                    <p><strong>Tipo:</strong> {selectedLembrete.lembrete.tipo}</p>
                    <p><strong>Status:</strong> {selectedLembrete.lembrete.status}</p>
                    <p><strong>Envio Agendado Para:</strong> {formatDateTime(selectedLembrete.lembrete.dataEnvioAgendado)}</p>
                    <p><strong>Mensagem (Atual):</strong></p>
                    <pre className="whitespace-pre-wrap bg-muted p-2 rounded-md text-xs">{selectedLembrete.lembrete.mensagem || `Lembrete: Seu agendamento para ${selectedLembrete.agendamento?.servicoNome || 'serviço'} com ${selectedLembrete.agendamento?.profissionalNome || 'profissional'} está marcado para ${selectedLembrete.agendamento ? formatDateTime(selectedLembrete.agendamento.dataHora) : 'data/hora'}.`}</pre>
                    
                    {selectedLembrete.agendamento && (
                        <>
                            <hr className="my-2"/>
                            <p className="font-semibold">Detalhes do Agendamento:</p>
                            <p><strong>Cliente:</strong> {selectedLembrete.agendamento.clienteNome}</p>
                            <p><strong>Serviço:</strong> {selectedLembrete.agendamento.servicoNome}</p>
                            <p><strong>Profissional:</strong> {selectedLembrete.agendamento.profissionalNome}</p>
                            <p><strong>Data/Hora Agendamento:</strong> {formatDateTime(selectedLembrete.agendamento.dataHora)}</p>
                        </>
                    )}
                    {!selectedLembrete.agendamento && (
                        <p className="text-destructive">Agendamento associado não encontrado ou foi excluído.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Editar Lembrete</DialogTitle>
            </DialogHeader>
            {editingLembrete && isEditModalOpen && (
                <LembreteForm
                    initialData={editingLembrete}
                    onSubmit={handleEditSubmit}
                    onCancel={handleCloseEditModal}
                />
            )}
            {isLoading && isEditModalOpen && (
                 <div className="p-6 space-y-4">
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
