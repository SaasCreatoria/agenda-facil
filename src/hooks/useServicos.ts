'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Servico, ServicoCreateDto } from '@/types';
import * as storage from '@/services/storage';
import { LS_SERVICOS_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadServicos = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const data = storage.getAll<Servico>(LS_SERVICOS_KEY);
        setServicos(data);
      } catch (error) {
        console.error('Error loading servicos:', error);
        toast({ variant: 'destructive', title: 'Erro ao carregar serviços', description: (error as Error).message });
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadServicos();
  }, [loadServicos]);

  const createServico = async (data: ServicoCreateDto): Promise<Servico | null> => {
    try {
      const newServico = storage.create<ServicoCreateDto, Servico>(LS_SERVICOS_KEY, data);
      setServicos(prev => [...prev, newServico]);
      toast({ title: 'Serviço criado', description: `Serviço "${newServico.nome}" adicionado.` });
      return newServico;
    } catch (error) {
      console.error('Error creating servico:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar serviço', description: (error as Error).message });
      return null;
    }
  };

  const updateServico = async (id: string, updates: Partial<Omit<Servico, 'id'>>): Promise<Servico | null> => {
    try {
      const updatedServico = storage.update<Servico>(LS_SERVICOS_KEY, id, updates);
      if (updatedServico) {
        setServicos(prev => prev.map(s => (s.id === id ? updatedServico : s)));
        toast({ title: 'Serviço atualizado', description: `Serviço "${updatedServico.nome}" atualizado.` });
        return updatedServico;
      }
      return null;
    } catch (error) {
      console.error('Error updating servico:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar serviço', description: (error as Error).message });
      return null;
    }
  };

  const removeServico = async (id: string): Promise<boolean> => {
    // Basic check: In a real app, check for future appointments using this service via useAgendamentos
    // For now, just simulate a simple check or skip it for brevity in this step.
    // Example: const { agendamentos } = useAgendamentos();
    // const hasFutureAppointments = agendamentos.some(a => a.servicoId === id && new Date(a.dataHora) > new Date());
    // if (hasFutureAppointments) {
    //   toast({ variant: 'destructive', title: 'Erro ao remover', description: 'Este serviço possui agendamentos futuros.'});
    //   return false;
    // }

    try {
      const success = storage.remove(LS_SERVICOS_KEY, id);
      if (success) {
        setServicos(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Serviço removido', description: 'O serviço foi removido com sucesso.' });
      }
      return success;
    } catch (error) {
      console.error('Error removing servico:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover serviço', description: (error as Error).message });
      return false;
    }
  };
  
  const getServicoById = useCallback((id: string): Servico | undefined => {
    return servicos.find(s => s.id === id);
  }, [servicos]);


  return {
    servicos,
    loading,
    loadServicos,
    createServico,
    updateServico,
    removeServico,
    getServicoById,
  };
}