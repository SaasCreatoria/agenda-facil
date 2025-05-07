'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profissional, ProfissionalCreateDto, HorarioDisponivel } from '@/types';
import * as storage from '@/services/storage';
import { LS_PROFISSIONAIS_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function useProfissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProfissionais = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const data = storage.getAll<Profissional>(LS_PROFISSIONAIS_KEY);
        setProfissionais(data);
      } catch (error) {
        console.error('Error loading profissionais:', error);
        toast({ variant: 'destructive', title: 'Erro ao carregar profissionais', description: (error as Error).message });
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadProfissionais();
  }, [loadProfissionais]);

  const createProfissional = async (data: ProfissionalCreateDto): Promise<Profissional | null> => {
    // Validate unique email (if provided)
    if (data.email && profissionais.some(p => p.email === data.email)) {
      toast({ variant: 'destructive', title: 'Erro ao criar profissional', description: 'Este email já está em uso.' });
      return null;
    }
    try {
      const newProfissional = storage.create<ProfissionalCreateDto, Profissional>(LS_PROFISSIONAIS_KEY, data);
      setProfissionais(prev => [...prev, newProfissional]);
      toast({ title: 'Profissional criado', description: `Profissional "${newProfissional.nome}" adicionado.` });
      return newProfissional;
    } catch (error) {
      console.error('Error creating profissional:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar profissional', description: (error as Error).message });
      return null;
    }
  };

  const updateProfissional = async (id: string, updates: Partial<Omit<Profissional, 'id'>>): Promise<Profissional | null> => {
    // Validate unique email if email is being changed
    if (updates.email && profissionais.some(p => p.id !== id && p.email === updates.email)) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar profissional', description: 'Este email já está em uso por outro profissional.' });
      return null;
    }
    try {
      const updatedProfissional = storage.update<Profissional>(LS_PROFISSIONAIS_KEY, id, updates);
      if (updatedProfissional) {
        setProfissionais(prev => prev.map(p => (p.id === id ? updatedProfissional : p)));
        toast({ title: 'Profissional atualizado', description: `Profissional "${updatedProfissional.nome}" atualizado.` });
        // Here you might check for appointment conflicts if `horariosDisponiveis` changed
        // For now, just a notification.
        if(updates.horariosDisponiveis) {
            toast({variant: 'default', title: 'Disponibilidade Alterada', description: 'Verifique se agendamentos existentes conflitam com os novos horários.'})
        }
        return updatedProfissional;
      }
      return null;
    } catch (error) {
      console.error('Error updating profissional:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar profissional', description: (error as Error).message });
      return null;
    }
  };

  const removeProfissional = async (id: string): Promise<boolean> => {
    // Basic check: In a real app, check for future appointments with this professional
    try {
      const success = storage.remove(LS_PROFISSIONAIS_KEY, id);
      if (success) {
        setProfissionais(prev => prev.filter(p => p.id !== id));
        toast({ title: 'Profissional removido', description: 'O profissional foi removido com sucesso.' });
      }
      return success;
    } catch (error) {
      console.error('Error removing profissional:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover profissional', description: (error as Error).message });
      return false;
    }
  };

  const getProfissionalById = useCallback((id: string): Profissional | undefined => {
    return profissionais.find(p => p.id === id);
  }, [profissionais]);

  return {
    profissionais,
    loading,
    loadProfissionais,
    createProfissional,
    updateProfissional,
    removeProfissional,
    getProfissionalById
  };
}