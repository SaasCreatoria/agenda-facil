'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LembreteTable from '@/components/lembretes/lembrete-table';
import { useAppContext } from '@/contexts/app-context';
import type { Lembrete, Agendamento } from '@/types';
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
  } = useAppContext();
  
  const { toast } = useToast();
  const [selectedLembrete, setSelectedLembrete] = useState<{lembrete: Lembrete, agendamento?: Agendamento} | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleResendLembrete = async (lembrete: Lembrete) => {
    if (lembrete.status === 'ENVIADO') {
        toast({ title: 'Lembrete já enviado', description: 'Este lembrete já foi enviado com sucesso.', variant: 'default'});
        return;
    }
    await sendReminder(lembrete); 
  };

  const handleViewDetails = (lembrete: Lembrete, agendamento?: Agendamento) => {
    setSelectedLembrete({lembrete, agendamento});
    setIsDetailModalOpen(true);
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
            />
          )}
        </CardContent>
      </Card>

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
                    <p><strong>Mensagem (Exemplo):</strong> {selectedLembrete.lembrete.mensagem || `Lembrete: Seu agendamento para ${selectedLembrete.agendamento?.servicoNome || 'serviço'} com ${selectedLembrete.agendamento?.profissionalNome || 'profissional'} está marcado para ${selectedLembrete.agendamento ? formatDateTime(selectedLembrete.agendamento.dataHora) : 'data/hora'}.`}</p>
                    
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
    </>
  );
}