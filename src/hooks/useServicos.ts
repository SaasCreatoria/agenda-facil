'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Servico, ServicoCreateDto } from '@/types';
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
  orderBy,
  Timestamp
} from 'firebase/firestore';

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadServicos = useCallback(async () => {
    if (!user) {
      setServicos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const servicosCollectionRef = collection(db, 'users', user.uid, 'servicos');
      const q = query(servicosCollectionRef, orderBy('nome'));
      const querySnapshot = await getDocs(q);
      const fetchedServicos: Servico[] = [];
      querySnapshot.forEach((docSnap) => { // Changed doc to docSnap
        const data = docSnap.data();
        fetchedServicos.push({ 
          id: docSnap.id, 
          ...data,
          // Handle Firestore Timestamps
          criadoEm: data.criadoEm instanceof Timestamp ? data.criadoEm.toDate().toISOString() : data.criadoEm,
          atualizadoEm: data.atualizadoEm instanceof Timestamp ? data.atualizadoEm.toDate().toISOString() : data.atualizadoEm,
        } as Servico);
      });
      setServicos(fetchedServicos);
    } catch (error) {
      console.error('Error loading servicos:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar serviços', description: (error as Error).message });
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadServicos();
  }, [loadServicos]);

  const createServico = async (data: ServicoCreateDto): Promise<Servico | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para criar um serviço.' });
      return null;
    }
    try {
      const servicosCollectionRef = collection(db, 'users', user.uid, 'servicos');
      const servicoData = {
        ...data,
        preco: Number(data.preco), // Ensure preco is a number
        duracaoMinutos: Number(data.duracaoMinutos), // Ensure duracaoMinutos is a number
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      };
      const docRef = await addDoc(servicosCollectionRef, servicoData);
      // For immediate UI update, we use client-side timestamp approximation
      const newServico: Servico = { 
        id: docRef.id, 
        ...data, 
        preco: Number(data.preco),
        duracaoMinutos: Number(data.duracaoMinutos),
        criadoEm: new Date().toISOString(), 
        atualizadoEm: new Date().toISOString()
      };
      setServicos(prev => [...prev, newServico].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({ title: 'Serviço criado', description: `Serviço "${newServico.nome}" adicionado.` });
      return newServico;
    } catch (error) {
      console.error('Error creating servico:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar serviço', description: (error as Error).message });
      return null;
    }
  };

  const updateServico = async (id: string, updates: Partial<Omit<Servico, 'id' | 'criadoEm'>>): Promise<Servico | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para atualizar um serviço.' });
      return null;
    }
    try {
      const servicoDocRef = doc(db, 'users', user.uid, 'servicos', id);
      const updateData = {
        ...updates,
        ...(updates.preco !== undefined && { preco: Number(updates.preco) }), // Ensure preco is a number if present
        ...(updates.duracaoMinutos !== undefined && { duracaoMinutos: Number(updates.duracaoMinutos) }), // Ensure duracaoMinutos is a number if present
        atualizadoEm: serverTimestamp(),
      };
      await updateDoc(servicoDocRef, updateData);
      
      // For immediate UI update
      const updatedServicoLocal: Servico = { 
          ...(servicos.find(s => s.id ===id) as Servico), // Get current local state
          ...updates, // Apply updates
          ...(updates.preco !== undefined && { preco: Number(updates.preco) }),
          ...(updates.duracaoMinutos !== undefined && { duracaoMinutos: Number(updates.duracaoMinutos) }),
          atualizadoEm: new Date().toISOString() // Approximate client-side timestamp
      };

      setServicos(prev => prev.map(s => (s.id === id ? updatedServicoLocal : s)).sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({ title: 'Serviço atualizado', description: `Serviço "${updatedServicoLocal.nome}" atualizado.` });
      return updatedServicoLocal;
    } catch (error) {
      console.error('Error updating servico:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar serviço', description: (error as Error).message });
      return null;
    }
  };

  const removeServico = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para remover um serviço.' });
      return false;
    }
    // In a real app, check for future appointments with this servico from Firestore or context.
    // This is currently handled in the page component (src/app/(app)/servicos/page.tsx)
    try {
      const servicoDocRef = doc(db, 'users', user.uid, 'servicos', id);
      await deleteDoc(servicoDocRef);
      setServicos(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Serviço removido', description: 'O serviço foi removido com sucesso.' });
      return true;
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
