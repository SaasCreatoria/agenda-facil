
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lembrete, LembreteCreateDto, Agendamento, ConfiguracaoEmpresa } from '@/types';
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
  orderBy,
  where
} from 'firebase/firestore';
import { formatDateTime } from '@/utils/helpers';

export function useLembretes() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const denormalizeLembrete = (lembreteData: any): Lembrete => {
    return {
      ...lembreteData,
      id: lembreteData.id, // Ensure id is present
      dataEnvioAgendado: lembreteData.dataEnvioAgendado instanceof Timestamp 
        ? lembreteData.dataEnvioAgendado.toDate().toISOString() 
        : lembreteData.dataEnvioAgendado,
      criadoEm: lembreteData.criadoEm instanceof Timestamp 
        ? lembreteData.criadoEm.toDate().toISOString() 
        : lembreteData.criadoEm,
      atualizadoEm: lembreteData.atualizadoEm instanceof Timestamp 
        ? lembreteData.atualizadoEm.toDate().toISOString() 
        : lembreteData.atualizadoEm,
    } as Lembrete;
  };

  const loadLembretes = useCallback(async () => {
    if (!user) {
      setLembretes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const lembretesCollectionRef = collection(db, 'users', user.uid, 'lembretes');
      const q = query(lembretesCollectionRef, orderBy('dataEnvioAgendado', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedLembretes = querySnapshot.docs.map(docSnap => 
        denormalizeLembrete({ id: docSnap.id, ...docSnap.data() })
      );
      setLembretes(fetchedLembretes);
    } catch (error) {
      console.error('Error loading lembretes:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar lembretes', description: (error as Error).message });
      setLembretes([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadLembretes();
  }, [loadLembretes, user]); // Added user to dependencies

  const createLembrete = useCallback(async (agendamento: Agendamento, config: ConfiguracaoEmpresa): Promise<Lembrete | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para criar um lembrete.' });
      return null;
    }

    const dataHoraAgendamento = new Date(agendamento.dataHora);
    const dataEnvioAgendado = new Date(dataHoraAgendamento.getTime() - config.antecedenciaLembreteHoras * 60 * 60 * 1000);

    if (dataEnvioAgendado < new Date()) {
      console.log(`Reminder for agendamento ${agendamento.id} not created as its scheduled send time is in the past.`);
      return null;
    }

    const lembreteDto: LembreteCreateDto = {
      agendamentoId: agendamento.id,
      tipo: config.canalLembretePadrao,
      dataEnvioAgendado: dataEnvioAgendado.toISOString(), // Keep as ISO string for DTO
      status: 'PENDENTE',
      mensagem: `Lembrete: Seu agendamento para ${agendamento.servicoNome || 'serviço'} com ${agendamento.profissionalNome || 'profissional'} está marcado para ${formatDateTime(dataHoraAgendamento)}.`,
    };
    
    const lembreteDataForFirestore = {
        ...lembreteDto,
        dataEnvioAgendado: Timestamp.fromDate(new Date(lembreteDto.dataEnvioAgendado)),
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
    };

    try {
      // Check if a PENDENTE reminder already exists for this appointment in Firestore
      const lembretesCollectionRef = collection(db, 'users', user.uid, 'lembretes');
      const q = query(lembretesCollectionRef, 
                      where("agendamentoId", "==", agendamento.id), 
                      where("status", "==", "PENDENTE"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If an existing pending reminder is found, update it if necessary or just return it.
        const existingDoc = querySnapshot.docs[0];
        const existingLembrete = denormalizeLembrete({ id: existingDoc.id, ...existingDoc.data() });
        // For now, assume if it exists, we don't create a new one. Could add update logic here.
        console.log(`Pending reminder for agendamento ${agendamento.id} already exists in Firestore.`);
        return existingLembrete;
      }
      
      const docRef = await addDoc(lembretesCollectionRef, lembreteDataForFirestore);
      const newLembrete = denormalizeLembrete({
        id: docRef.id,
        ...lembreteDto, // Original DTO data
        // Timestamps will be set by Firestore, so use approximate local values or re-fetch for perfect accuracy
        criadoEm: new Date().toISOString(), 
        atualizadoEm: new Date().toISOString()
      });
      
      setLembretes(prev => [...prev, newLembrete].sort((a,b) => new Date(b.dataEnvioAgendado).getTime() - new Date(a.dataEnvioAgendado).getTime()));
      toast({ title: 'Lembrete criado', description: `Lembrete para agendamento agendado.` });
      return newLembrete;
    } catch (error) {
      console.error('Error creating lembrete:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar lembrete', description: (error as Error).message });
      return null;
    }
  }, [user, toast]);

  const updateLembreteStatus = useCallback(async (id: string, status: Lembrete['status']): Promise<Lembrete | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Erro ao atualizar status do lembrete.' });
      return null;
    }
    try {
      const lembreteDocRef = doc(db, 'users', user.uid, 'lembretes', id);
      const updateData = { status, atualizadoEm: serverTimestamp() };
      await updateDoc(lembreteDocRef, updateData);
      
      const existingLembrete = lembretes.find(l => l.id === id);
      if (existingLembrete) {
        const updatedLembreteLocal = denormalizeLembrete({
          ...existingLembrete,
          status,
          atualizadoEm: new Date().toISOString(), // Approximate for UI
        });
        setLembretes(prev => prev.map(l => (l.id === id ? updatedLembreteLocal : l)));
        // Toast moved to sendReminder to avoid double toasting
        return updatedLembreteLocal;
      }
      return null;
    } catch (error) {
      console.error('Error updating lembrete status:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar lembrete', description: (error as Error).message });
      return null;
    }
  }, [user, toast, lembretes]);

  const removeLembrete = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Erro ao remover lembrete.' });
      return false;
    }
    try {
      const lembreteDocRef = doc(db, 'users', user.uid, 'lembretes', id);
      await deleteDoc(lembreteDocRef);
      setLembretes(prev => prev.filter(l => l.id !== id));
      toast({ title: 'Lembrete removido' });
      return true;
    } catch (error) {
      console.error('Error removing lembrete:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover lembrete', description: (error as Error).message });
      return false;
    }
  }, [user, toast]);
  
  const getLembreteById = useCallback((id: string): Lembrete | undefined => {
    return lembretes.find(l => l.id === id);
  }, [lembretes]);

  const sendReminder = useCallback(async (lembrete: Lembrete): Promise<void> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Erro ao enviar lembrete.' });
      return;
    }
    console.log(`Simulating sending reminder ${lembrete.id} via ${lembrete.tipo}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const success = Math.random() > 0.1; // 90% success rate
    const newStatus = success ? 'ENVIADO' : 'FALHOU';
    await updateLembreteStatus(lembrete.id, newStatus);
    toast({
        title: `Lembrete ${success ? 'Enviado' : 'Falhou'}`,
        description: `O lembrete para o agendamento ${lembrete.agendamentoId.substring(0,8)}... foi ${newStatus.toLowerCase()}.`,
        variant: success ? 'default' : 'destructive'
    });
  }, [user, toast, updateLembreteStatus]);

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
