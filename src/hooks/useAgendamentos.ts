'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Agendamento, AgendamentoCreateDto, Servico, Profissional, Cliente, ConfiguracaoEmpresa } from '@/types';
import * as storage from '@/services/storage';
import { LS_AGENDAMENTOS_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { checkConflict } from '@/utils/appointment-helpers';
// Import hooks at the top level, not inside other hooks or functions
// import { useLembretes } from './useLembretes'; 
// import { useServicos } from './useServicos';
// import { useProfissionais } from './useProfissionais';
// import { useClientes } from './useClientes';


// Forward declaration for AppContext structure to avoid circular dependencies if AppContext imports this hook
// This is a common pattern for complex state management.
// Alternatively, pass createLembrete, getServicoById etc. as props or from a shared service.
interface AppContextServices {
  createLembrete: (agendamento: Agendamento, config: ConfiguracaoEmpresa) => Promise<any>;
  getServicoById: (id: string) => Servico | undefined;
  getProfissionalById: (id: string) => Profissional | undefined;
  getClienteById: (id: string) => Cliente | undefined;
}


export function useAgendamentos(services?: AppContextServices) { // Make services optional for now
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // If services are not passed, these will be undefined. Handle gracefully.
  const internalCreateLembrete = services?.createLembrete;
  const internalGetServicoById = services?.getServicoById;
  const internalGetProfissionalById = services?.getProfissionalById;
  const internalGetClienteById = services?.getClienteById;


  const loadAgendamentos = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const data = storage.getAll<Agendamento>(LS_AGENDAMENTOS_KEY);
        // Optionally enrich data here if not stored denormalized
        const enrichedData = data.map(ag => {
            const servico = internalGetServicoById ? internalGetServicoById(ag.servicoId) : undefined;
            const profissional = internalGetProfissionalById ? internalGetProfissionalById(ag.profissionalId) : undefined;
            const cliente = internalGetClienteById ? internalGetClienteById(ag.clienteId) : undefined;
            return {
                ...ag,
                servicoNome: servico?.nome || ag.servicoNome || 'Serviço Desconhecido',
                profissionalNome: profissional?.nome || ag.profissionalNome || 'Profissional Desconhecido',
                clienteNome: cliente?.nome || ag.clienteNome || 'Cliente Desconhecido',
            }
        })
        setAgendamentos(enrichedData);
      } catch (error) {
        console.error('Error loading agendamentos:', error);
        toast({ variant: 'destructive', title: 'Erro ao carregar agendamentos', description: (error as Error).message });
      }
    }
    setLoading(false);
  }, [toast, internalGetServicoById, internalGetProfissionalById, internalGetClienteById]);

  useEffect(() => {
    if(internalGetServicoById && internalGetProfissionalById && internalGetClienteById) { // Only load if services are available
        loadAgendamentos();
    } else if (!services) { // If services are not expected (e.g. unit test), still proceed
        loadAgendamentos();
    }
    // If services are expected but not yet available (e.g. context still loading), this effect will re-run when they are.
  }, [loadAgendamentos, services, internalGetServicoById, internalGetProfissionalById, internalGetClienteById]);

  const createAgendamento = async (data: AgendamentoCreateDto, config: ConfiguracaoEmpresa): Promise<Agendamento | null> => {
    if (!internalGetServicoById || !internalCreateLembrete || !internalGetProfissionalById || !internalGetClienteById) {
        toast({ variant: 'destructive', title: 'Erro interno', description: 'Serviços de contexto não disponíveis.'});
        return null;
    }

    const servico = internalGetServicoById(data.servicoId);
    if (!servico) {
        toast({ variant: 'destructive', title: 'Erro ao criar agendamento', description: 'Serviço não encontrado.'});
        return null;
    }

    const agendamentoParaVerificar = {
        ...data,
        id: '', // Temporary ID for conflict check, won't be saved
        duracaoMinutos: servico.duracaoMinutos, 
        dataHora: data.dataHora, 
        profissionalId: data.profissionalId,
        servicoId: data.servicoId
    };
    
    const conflictingAgendamento = checkConflict(agendamentoParaVerificar, agendamentos);
    if (conflictingAgendamento) {
      toast({ variant: 'destructive', title: 'Conflito de Horário', description: `Este horário conflita com outro agendamento para o mesmo profissional.` });
      return null;
    }
    
    const now = new Date().toISOString();
    const newAgendamentoData: Omit<Agendamento, 'id'> = { // Data for storage.create (id will be generated by storage)
        ...data,
        duracaoMinutos: servico.duracaoMinutos,
        criadoEm: now,
        atualizadoEm: now,
        status: data.status || 'PENDENTE', 
        clienteNome: internalGetClienteById(data.clienteId)?.nome || 'Cliente Desconhecido',
        profissionalNome: internalGetProfissionalById(data.profissionalId)?.nome || 'Profissional Desconhecido',
        servicoNome: servico.nome,
    };

    try {
      // storage.create will add the 'id'
      const createdAgendamento = storage.create<Omit<Agendamento, 'id'>, Agendamento>(LS_AGENDAMENTOS_KEY, newAgendamentoData);
      
      setAgendamentos(prev => [...prev, createdAgendamento]); // Use the agendamento returned by storage.create
      toast({ title: 'Agendamento criado', description: `Agendamento para ${servico.nome} criado com sucesso.` });
      
      if ((createdAgendamento.status === 'CONFIRMADO' || createdAgendamento.status === 'PENDENTE') && internalCreateLembrete) {
        await internalCreateLembrete(createdAgendamento, config);
      }
      return createdAgendamento;
    } catch (error) {
      console.error('Error creating agendamento:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar agendamento', description: (error as Error).message });
      return null;
    }
  };

  const updateAgendamento = async (id: string, updates: Partial<Omit<Agendamento, 'id' | 'criadoEm' | 'servicoNome' | 'profissionalNome' | 'clienteNome' >>, config: ConfiguracaoEmpresa): Promise<Agendamento | null> => {
    if (!internalGetServicoById || !internalCreateLembrete || !internalGetProfissionalById || !internalGetClienteById) {
        toast({ variant: 'destructive', title: 'Erro interno', description: 'Serviços de contexto não disponíveis.'});
        return null;
    }

    const existingAgendamento = agendamentos.find(a => a.id === id);
    if (!existingAgendamento) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Agendamento não encontrado.'});
        return null;
    }

    const servicoId = updates.servicoId || existingAgendamento.servicoId;
    const servico = internalGetServicoById(servicoId);
    if (!servico) {
         toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Serviço associado não encontrado.'});
        return null;
    }

    const dataParaVerificar = {
        id: id,
        dataHora: updates.dataHora || existingAgendamento.dataHora,
        profissionalId: updates.profissionalId || existingAgendamento.profissionalId,
        servicoId: servicoId,
        duracaoMinutos: updates.duracaoMinutos ?? servico.duracaoMinutos,
    };

    const conflictingAgendamento = checkConflict(dataParaVerificar, agendamentos);
    if (conflictingAgendamento) {
      toast({ variant: 'destructive', title: 'Conflito de Horário', description: `Este horário conflita com outro agendamento para o mesmo profissional.` });
      return null;
    }

    try {
      const finalUpdates = {
        ...updates,
        duracaoMinutos: dataParaVerificar.duracaoMinutos, 
        atualizadoEm: new Date().toISOString(),
        // Re-enrich names if IDs changed
        ...(updates.servicoId && { servicoNome: internalGetServicoById(updates.servicoId)?.nome }),
        ...(updates.profissionalId && { profissionalNome: internalGetProfissionalById(updates.profissionalId)?.nome }),
        ...(updates.clienteId && { clienteNome: internalGetClienteById(updates.clienteId)?.nome }),
      };
      const updatedAgendamentoStored = storage.update<Agendamento>(LS_AGENDAMENTOS_KEY, id, finalUpdates);
      
      if (updatedAgendamentoStored) {
        setAgendamentos(prev => prev.map(a => (a.id === id ? updatedAgendamentoStored : a)));
        toast({ title: 'Agendamento atualizado', description: `Agendamento atualizado com sucesso.` });

        if (((updates.status === 'CONFIRMADO' || updates.status === 'PENDENTE') && updatedAgendamentoStored.status !== existingAgendamento.status) && internalCreateLembrete) {
             await internalCreateLembrete(updatedAgendamentoStored, config);
        }
        return updatedAgendamentoStored;
      }
      return null;
    } catch (error) {
      console.error('Error updating agendamento:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar agendamento', description: (error as Error).message });
      return null;
    }
  };

  const removeAgendamento = async (id: string): Promise<boolean> => {
    try {
      const success = storage.remove(LS_AGENDAMENTOS_KEY, id);
      if (success) {
        setAgendamentos(prev => prev.filter(a => a.id !== id));
        // Optionally remove associated reminders
        toast({ title: 'Agendamento removido', description: 'O agendamento foi removido com sucesso.' });
      }
      return success;
    } catch (error) {
      console.error('Error removing agendamento:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover agendamento', description: (error as Error).message });
      return false;
    }
  };

  const getAgendamentoById = useCallback((id: string): Agendamento | undefined => {
    return agendamentos.find(a => a.id === id);
  }, [agendamentos]);

  return {
    agendamentos,
    loading,
    loadAgendamentos,
    createAgendamento,
    updateAgendamento,
    removeAgendamento,
    getAgendamentoById,
  };
}