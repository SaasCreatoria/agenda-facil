'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lembrete, LembreteCreateDto, Agendamento, ConfiguracaoEmpresa } from '@/types';
import * as storage from '@/services/storage';
import { LS_LEMBRETES_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime } from '@/utils/helpers'; // Assuming you have this helper

export function useLembretes() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadLembretes = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const data = storage.getAll<Lembrete>(LS_LEMBRETES_KEY);
        setLembretes(data);
      } catch (error) {
        console.error('Error loading lembretes:', error);
        toast({ variant: 'destructive', title: 'Erro ao carregar lembretes', description: (error as Error).message });
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadLembretes();
  }, [loadLembretes]);

  const createLembrete = async (agendamento: Agendamento, config: ConfiguracaoEmpresa): Promise<Lembrete | null> => {
    const dataHoraAgendamento = new Date(agendamento.dataHora);
    const dataEnvioAgendado = new Date(dataHoraAgendamento.getTime() - config.antecedenciaLembreteHoras * 60 * 60 * 1000);

    // Do not create reminder if it's already in the past relative to now
    if (dataEnvioAgendado < new Date()) {
        console.log(`Reminder for agendamento ${agendamento.id} not created as its scheduled send time is in the past.`);
        return null;
    }

    const nowISO = new Date().toISOString();
    const lembreteData: LembreteCreateDto = {
      agendamentoId: agendamento.id,
      tipo: config.canalLembretePadrao,
      dataEnvioAgendado: dataEnvioAgendado.toISOString(),
      status: 'PENDENTE',
      mensagem: `Lembrete: Seu agendamento para ${agendamento.servicoNome || 'serviço'} com ${agendamento.profissionalNome || 'profissional'} está marcado para ${formatDateTime(dataHoraAgendamento)}.`,
    };

    try {
      // Check if a PENDENTE reminder already exists for this appointment
      const existingPending = lembretes.find(l => l.agendamentoId === agendamento.id && l.status === 'PENDENTE');
      if (existingPending) {
        // Optionally update the existing one if dataEnvioAgendado or message changed
        // For now, just return the existing one
        console.log(`Pending reminder for agendamento ${agendamento.id} already exists.`);
        return existingPending;
      }
      
      const fullLembreteData = {
          ...lembreteData,
          criadoEm: nowISO,
          atualizadoEm: nowISO,
      }

      const newLembrete = storage.create<Omit<Lembrete, 'id'>, Lembrete>(LS_LEMBRETES_KEY, fullLembreteData, false);
      setLembretes(prev => [...prev, newLembrete]);
      toast({ title: 'Lembrete criado', description: `Lembrete para agendamento agendado.` });
      return newLembrete;
    } catch (error) {
      console.error('Error creating lembrete:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar lembrete', description: (error as Error).message });
      return null;
    }
  };

  const updateLembreteStatus = async (id: string, status: Lembrete['status']): Promise<Lembrete | null> => {
    try {
      const updatedLembrete = storage.update<Lembrete>(LS_LEMBRETES_KEY, id, { status, atualizadoEm: new Date().toISOString() });
      if (updatedLembrete) {
        setLembretes(prev => prev.map(l => (l.id === id ? updatedLembrete : l)));
        // toast({ title: 'Status do Lembrete Atualizado', description: `Lembrete ${id} agora está ${status}.` });
        return updatedLembrete;
      }
      return null;
    } catch (error) {
      console.error('Error updating lembrete status:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar lembrete', description: (error as Error).message });
      return null;
    }
  };

  const removeLembrete = async (id: string): Promise<boolean> => {
    try {
      const success = storage.remove(LS_LEMBRETES_KEY, id);
      if (success) {
        setLembretes(prev => prev.filter(l => l.id !== id));
        toast({ title: 'Lembrete removido' });
      }
      return success;
    } catch (error) {
      console.error('Error removing lembrete:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover lembrete', description: (error as Error).message });
      return false;
    }
  };
  
  const getLembreteById = useCallback((id: string): Lembrete | undefined => {
    return lembretes.find(l => l.id === id);
  }, [lembretes]);


  const sendReminder = async (lembrete: Lembrete): Promise<void> => {
    console.log(`Simulating sending reminder ${lembrete.id} via ${lembrete.tipo}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    const newStatus = success ? 'ENVIADO' : 'FALHOU';
    await updateLembreteStatus(lembrete.id, newStatus);
    toast({
        title: `Lembrete ${success ? 'Enviado' : 'Falhou'}`,
        description: `O lembrete para o agendamento ${lembrete.agendamentoId} foi ${newStatus.toLowerCase()}.`,
        variant: success ? 'default' : 'destructive'
    });
  }


  return {
    lembretes,
    loading,
    loadLembretes,
    createLembrete,
    updateLembreteStatus,
    removeLembrete,
    getLembreteById,
    sendReminder,
  };
}