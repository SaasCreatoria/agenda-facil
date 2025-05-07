
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Agendamento, AgendamentoCreateDto, Servico, Profissional, Cliente, ConfiguracaoEmpresa } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { checkConflict } from '@/utils/appointment-helpers';

interface AppContextServices {
  createLembrete: (agendamento: Agendamento, config: ConfiguracaoEmpresa) => Promise<any>;
  getServicoById: (id: string) => Servico | undefined;
  getProfissionalById: (id: string) => Profissional | undefined;
  getClienteById: (id: string) => Cliente | undefined;
}

export function useAgendamentos(services?: AppContextServices) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const internalCreateLembrete = services?.createLembrete;
  const internalGetServicoById = services?.getServicoById;
  const internalGetProfissionalById = services?.getProfissionalById;
  const internalGetClienteById = services?.getClienteById;

  const denormalizeAgendamento = useCallback((agData: any): Agendamento => {
    const servico = internalGetServicoById ? internalGetServicoById(agData.servicoId) : undefined;
    const profissional = internalGetProfissionalById ? internalGetProfissionalById(agData.profissionalId) : undefined;
    const cliente = internalGetClienteById ? internalGetClienteById(agData.clienteId) : undefined;
    
    return {
      ...agData,
      id: agData.id, // ensure id is present
      dataHora: agData.dataHora instanceof Timestamp ? agData.dataHora.toDate().toISOString() : agData.dataHora,
      criadoEm: agData.criadoEm instanceof Timestamp ? agData.criadoEm.toDate().toISOString() : agData.criadoEm,
      atualizadoEm: agData.atualizadoEm instanceof Timestamp ? agData.atualizadoEm.toDate().toISOString() : agData.atualizadoEm,
      servicoNome: servico?.nome || agData.servicoNome || 'Serviço Desconhecido',
      profissionalNome: profissional?.nome || agData.profissionalNome || 'Profissional Desconhecido',
      clienteNome: cliente?.nome || agData.clienteNome || 'Cliente Desconhecido',
    } as Agendamento;
  }, [internalGetServicoById, internalGetProfissionalById, internalGetClienteById]);


  const loadAgendamentos = useCallback(async () => {
    if (!user) {
      setAgendamentos([]);
      setLoading(false);
      return;
    }
    // Ensure dependent services are loaded before attempting to denormalize
    if (!internalGetServicoById || !internalGetProfissionalById || !internalGetClienteById) {
        // If services are not ready, wait for them. This might happen if the context providing them is still loading.
        // The useEffect below has dependencies on these services, so it will re-run loadAgendamentos when they become available.
        setLoading(true); // Keep loading until services are ready
        return;
    }

    setLoading(true);
    try {
      const agendamentosCollectionRef = collection(db, 'users', user.uid, 'agendamentos');
      const q = query(agendamentosCollectionRef, orderBy('dataHora', 'desc')); // Order by appointment time
      const querySnapshot = await getDocs(q);
      const fetchedAgendamentos: Agendamento[] = querySnapshot.docs.map(docSnap => 
        denormalizeAgendamento({ id: docSnap.id, ...docSnap.data() })
      );
      setAgendamentos(fetchedAgendamentos);
    } catch (error) {
      console.error('Error loading agendamentos:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar agendamentos', description: (error as Error).message });
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast, denormalizeAgendamento, internalGetServicoById, internalGetProfissionalById, internalGetClienteById]);

  useEffect(() => {
    // Only load if user and all dependent service functions are available
    if (user && internalGetServicoById && internalGetProfissionalById && internalGetClienteById) {
        loadAgendamentos();
    } else if (!user) {
        setAgendamentos([]); // Clear data if user logs out
        setLoading(false);
    }
    // Dependencies ensure this runs when user logs in/out or when service getters become available
  }, [user, loadAgendamentos, internalGetServicoById, internalGetProfissionalById, internalGetClienteById]);


  const createAgendamento = async (data: AgendamentoCreateDto, config: ConfiguracaoEmpresa): Promise<Agendamento | null> => {
    if (!user || !internalGetServicoById || !internalCreateLembrete || !internalGetProfissionalById || !internalGetClienteById) {
      toast({ variant: 'destructive', title: 'Erro interno', description: 'Usuário não autenticado ou serviços de contexto não disponíveis.'});
      return null;
    }

    const servico = internalGetServicoById(data.servicoId);
    if (!servico) {
      toast({ variant: 'destructive', title: 'Erro ao criar agendamento', description: 'Serviço não encontrado.'});
      return null;
    }

    const agendamentoParaVerificar = {
      ...data,
      id: '', 
      duracaoMinutos: servico.duracaoMinutos,
      dataHora: data.dataHora, 
    };
    
    if (checkConflict(agendamentoParaVerificar, agendamentos)) {
      toast({ variant: 'destructive', title: 'Conflito de Horário', description: `Este horário conflita com outro agendamento para o mesmo profissional.` });
      return null;
    }
    
    const cliente = internalGetClienteById(data.clienteId);
    const profissional = internalGetProfissionalById(data.profissionalId);

    const agendamentoDataForFirestore = {
      ...data,
      dataHora: Timestamp.fromDate(new Date(data.dataHora)),
      duracaoMinutos: servico.duracaoMinutos,
      servicoNome: servico.nome, // Denormalized
      clienteNome: cliente?.nome || 'Cliente Desconhecido', // Denormalized
      profissionalNome: profissional?.nome || 'Profissional Desconhecido', // Denormalized
      status: data.status || 'PENDENTE',
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    };

    try {
      const agendamentosCollectionRef = collection(db, 'users', user.uid, 'agendamentos');
      const docRef = await addDoc(agendamentosCollectionRef, agendamentoDataForFirestore);
      
      // For immediate UI update, create a local version with approximate timestamps
      const createdAgendamentoLocal = denormalizeAgendamento({
        id: docRef.id,
        ...data, // original DTO data
        dataHora: data.dataHora, // Keep as ISO string for local state
        duracaoMinutos: servico.duracaoMinutos,
        servicoNome: servico.nome,
        clienteNome: cliente?.nome || 'Cliente Desconhecido',
        profissionalNome: profissional?.nome || 'Profissional Desconhecido',
        status: data.status || 'PENDENTE',
        criadoEm: new Date().toISOString(), 
        atualizadoEm: new Date().toISOString()
      });
      
      setAgendamentos(prev => [...prev, createdAgendamentoLocal].sort((a,b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()));
      toast({ title: 'Agendamento criado', description: `Agendamento para ${servico.nome} criado com sucesso.` });
      
      if ((createdAgendamentoLocal.status === 'CONFIRMADO' || createdAgendamentoLocal.status === 'PENDENTE') && internalCreateLembrete) {
        await internalCreateLembrete(createdAgendamentoLocal, config);
      }
      return createdAgendamentoLocal;
    } catch (error) {
      console.error('Error creating agendamento:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar agendamento', description: (error as Error).message });
      return null;
    }
  };

  const updateAgendamento = async (id: string, updates: Partial<Omit<Agendamento, 'id' | 'criadoEm'>>, config: ConfiguracaoEmpresa): Promise<Agendamento | null> => {
    if (!user || !internalGetServicoById || !internalCreateLembrete || !internalGetProfissionalById || !internalGetClienteById) {
      toast({ variant: 'destructive', title: 'Erro interno', description: 'Usuário não autenticado ou serviços de contexto não disponíveis.'});
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

    if (checkConflict(dataParaVerificar, agendamentos)) {
      toast({ variant: 'destructive', title: 'Conflito de Horário', description: `Este horário conflita com outro agendamento para o mesmo profissional.` });
      return null;
    }

    const agendamentoDocRef = doc(db, 'users', user.uid, 'agendamentos', id);
    const updateDataForFirestore: any = { ...updates, atualizadoEm: serverTimestamp() };
    if (updates.dataHora) {
      updateDataForFirestore.dataHora = Timestamp.fromDate(new Date(updates.dataHora));
    }
    if (updates.servicoId) {
        const updatedServico = internalGetServicoById(updates.servicoId);
        updateDataForFirestore.servicoNome = updatedServico?.nome || 'Serviço Desconhecido';
        updateDataForFirestore.duracaoMinutos = updatedServico?.duracaoMinutos || dataParaVerificar.duracaoMinutos;
    }
    if (updates.profissionalId) {
        updateDataForFirestore.profissionalNome = internalGetProfissionalById(updates.profissionalId)?.nome || 'Profissional Desconhecido';
    }
     if (updates.clienteId) {
        updateDataForFirestore.clienteNome = internalGetClienteById(updates.clienteId)?.nome || 'Cliente Desconhecido';
    }


    try {
      await updateDoc(agendamentoDocRef, updateDataForFirestore);
      
      const updatedAgendamentoLocal = denormalizeAgendamento({
        ...existingAgendamento,
        ...updates,
        atualizadoEm: new Date().toISOString(), // Local approximation
         // Ensure names and duration are updated if IDs changed
        servicoNome: updates.servicoId ? updateDataForFirestore.servicoNome : existingAgendamento.servicoNome,
        duracaoMinutos: updates.servicoId ? updateDataForFirestore.duracaoMinutos : existingAgendamento.duracaoMinutos,
        profissionalNome: updates.profissionalId ? updateDataForFirestore.profissionalNome : existingAgendamento.profissionalNome,
        clienteNome: updates.clienteId ? updateDataForFirestore.clienteNome : existingAgendamento.clienteNome,
      });

      setAgendamentos(prev => prev.map(a => (a.id === id ? updatedAgendamentoLocal : a)).sort((a,b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()));
      toast({ title: 'Agendamento atualizado', description: `Agendamento atualizado com sucesso.` });

      if (((updates.status === 'CONFIRMADO' || updates.status === 'PENDENTE') && updatedAgendamentoLocal.status !== existingAgendamento.status) && internalCreateLembrete) {
        await internalCreateLembrete(updatedAgendamentoLocal, config);
      }
      return updatedAgendamentoLocal;
    } catch (error) {
      console.error('Error updating agendamento:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar agendamento', description: (error as Error).message });
      return null;
    }
  };

  const removeAgendamento = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para remover um agendamento.' });
      return false;
    }
    try {
      const agendamentoDocRef = doc(db, 'users', user.uid, 'agendamentos', id);
      await deleteDoc(agendamentoDocRef);
      setAgendamentos(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Agendamento removido', description: 'O agendamento foi removido com sucesso.' });
      // Optionally remove associated reminders here if needed from Firestore
      return true;
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

