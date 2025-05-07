
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profissional, ProfissionalCreateDto } from '@/types';
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
  Timestamp,
  where
} from 'firebase/firestore';

export function useProfissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadProfissionais = useCallback(async () => {
    if (!user) {
      setProfissionais([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profissionaisCollectionRef = collection(db, 'users', user.uid, 'profissionais');
      const q = query(profissionaisCollectionRef, orderBy('nome')); // Assuming sorting by name
      const querySnapshot = await getDocs(q);
      const fetchedProfissionais: Profissional[] = [];
      querySnapshot.forEach((docSnap) => { // Changed doc to docSnap to avoid conflict with doc function
        const data = docSnap.data();
        fetchedProfissionais.push({ 
          id: docSnap.id, 
          ...data,
          // Assuming 'criadoEm' and 'atualizadoEm' might be added later; handle if they exist
          criadoEm: data.criadoEm instanceof Timestamp ? data.criadoEm.toDate().toISOString() : data.criadoEm,
          atualizadoEm: data.atualizadoEm instanceof Timestamp ? data.atualizadoEm.toDate().toISOString() : data.atualizadoEm,
        } as Profissional);
      });
      setProfissionais(fetchedProfissionais);
    } catch (error) {
      console.error('Error loading profissionais:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar profissionais', description: (error as Error).message });
      setProfissionais([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadProfissionais();
  }, [loadProfissionais]);

  const createProfissional = async (data: ProfissionalCreateDto): Promise<Profissional | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para criar um profissional.' });
      return null;
    }
    
    if (data.email) {
        const q = query(collection(db, 'users', user.uid, 'profissionais'), where("email", "==", data.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast({ variant: 'destructive', title: 'Erro ao criar profissional', description: 'Este email já está em uso.' });
            return null;
        }
    }

    try {
      const profissionaisCollectionRef = collection(db, 'users', user.uid, 'profissionais');
      // Add timestamps if they become part of the Profissional model
      const profissionalData = {
        ...data,
        criadoEm: serverTimestamp(), // If you add this to the model
        atualizadoEm: serverTimestamp(), // If you add this to the model
      };
      const docRef = await addDoc(profissionaisCollectionRef, profissionalData);
      const newProfissional: Profissional = { 
        id: docRef.id, 
        ...data, 
        // criadoEm: new Date().toISOString(), // Approximate for UI
        // atualizadoEm: new Date().toISOString(), // Approximate for UI
      };
      setProfissionais(prev => [...prev, newProfissional].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({ title: 'Profissional criado', description: `Profissional "${newProfissional.nome}" adicionado.` });
      return newProfissional;
    } catch (error) {
      console.error('Error creating profissional:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar profissional', description: (error as Error).message });
      return null;
    }
  };

  const updateProfissional = async (id: string, updates: Partial<Omit<Profissional, 'id'>>): Promise<Profissional | null> => {
     if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para atualizar um profissional.' });
      return null;
    }

    if (updates.email) {
        const q = query(collection(db, 'users', user.uid, 'profissionais'), where("email", "==", updates.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty && querySnapshot.docs[0].id !== id) {
             toast({ variant: 'destructive', title: 'Erro ao atualizar profissional', description: 'Este email já está em uso por outro profissional.' });
            return null;
        }
    }

    try {
      const profissionalDocRef = doc(db, 'users', user.uid, 'profissionais', id);
      const updateData = {
        ...updates,
        atualizadoEm: serverTimestamp(), // If you add this to the model
      };
      await updateDoc(profissionalDocRef, updateData);
      
      const updatedProfissionalLocal: Profissional = { 
          ...(profissionais.find(p => p.id ===id) as Profissional),
          ...updates,
          // atualizadoEm: new Date().toISOString() // Approximate for UI
      };

      setProfissionais(prev => prev.map(p => (p.id === id ? updatedProfissionalLocal : p)).sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({ title: 'Profissional atualizado', description: `Profissional "${updatedProfissionalLocal.nome}" atualizado.` });
       if(updates.horariosDisponiveis) {
            toast({variant: 'default', title: 'Disponibilidade Alterada', description: 'Verifique se agendamentos existentes conflitam com os novos horários.'})
        }
      return updatedProfissionalLocal;
    } catch (error) {
      console.error('Error updating profissional:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar profissional', description: (error as Error).message });
      return null;
    }
  };

  const removeProfissional = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para remover um profissional.' });
      return false;
    }
    // In a real app, check for future appointments linked to this professional from Firestore.
    try {
      const profissionalDocRef = doc(db, 'users', user.uid, 'profissionais', id);
      await deleteDoc(profissionalDocRef);
      setProfissionais(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Profissional removido', description: 'O profissional foi removido com sucesso.' });
      return true;
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
