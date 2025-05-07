'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Cliente, ClienteCreateDto } from '@/types';
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

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadClientes = useCallback(async () => {
    if (!user) {
      setClientes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const clientesCollectionRef = collection(db, 'users', user.uid, 'clientes');
      const q = query(clientesCollectionRef, orderBy('nome'));
      const querySnapshot = await getDocs(q);
      const fetchedClientes: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedClientes.push({ 
          id: doc.id, 
          ...data,
          // Ensure timestamps are handled correctly, they might be Firestore Timestamps
          criadoEm: data.criadoEm instanceof Timestamp ? data.criadoEm.toDate().toISOString() : data.criadoEm,
          atualizadoEm: data.atualizadoEm instanceof Timestamp ? data.atualizadoEm.toDate().toISOString() : data.atualizadoEm,
        } as Cliente);
      });
      setClientes(fetchedClientes);
    } catch (error) {
      console.error('Error loading clientes:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar clientes', description: (error as Error).message });
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const createCliente = async (data: ClienteCreateDto): Promise<Cliente | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para criar um cliente.' });
      return null;
    }
    
    // Optional: Validate unique phone on Firestore side if needed via query, or rely on UI constraints.
    // For simplicity, we'll allow duplicates here, but UI might prevent it.

    try {
      const clientesCollectionRef = collection(db, 'users', user.uid, 'clientes');
      const clienteData = {
        ...data,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      };
      const docRef = await addDoc(clientesCollectionRef, clienteData);
      const newCliente: Cliente = { 
        id: docRef.id, 
        ...data, 
        criadoEm: new Date().toISOString(), // Approximate client-side timestamp for immediate UI update
        atualizadoEm: new Date().toISOString() // Approximate
      };
      setClientes(prev => [...prev, newCliente].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({ title: 'Cliente criado', description: `Cliente "${newCliente.nome}" adicionado.` });
      return newCliente;
    } catch (error) {
      console.error('Error creating cliente:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar cliente', description: (error as Error).message });
      return null;
    }
  };

  const updateCliente = async (id: string, updates: Partial<Omit<Cliente, 'id' | 'criadoEm'>>): Promise<Cliente | null> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para atualizar um cliente.' });
      return null;
    }
    
    // Optional: Add Firestore-side validation for unique phone if necessary.

    try {
      const clienteDocRef = doc(db, 'users', user.uid, 'clientes', id);
      const updateData = {
        ...updates,
        atualizadoEm: serverTimestamp(),
      };
      await updateDoc(clienteDocRef, updateData);
      
      const updatedClienteLocal = { 
          ...(clientes.find(c => c.id ===id) as Cliente), // Get current local state
          ...updates, // Apply updates
          atualizadoEm: new Date().toISOString() // Approximate client-side timestamp
      };

      setClientes(prev => prev.map(c => (c.id === id ? updatedClienteLocal : c)).sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({ title: 'Cliente atualizado', description: `Cliente "${updatedClienteLocal.nome}" atualizado.` });
      return updatedClienteLocal;
    } catch (error) {
      console.error('Error updating cliente:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar cliente', description: (error as Error).message });
      return null;
    }
  };

  const removeCliente = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para remover um cliente.' });
      return false;
    }
    // In a real app, check for future appointments with this cliente from Firestore.
    try {
      const clienteDocRef = doc(db, 'users', user.uid, 'clientes', id);
      await deleteDoc(clienteDocRef);
      setClientes(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Cliente removido', description: 'O cliente foi removido com sucesso.' });
      return true;
    } catch (error) {
      console.error('Error removing cliente:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover cliente', description: (error as Error).message });
      return false;
    }
  };

  const getClienteById = useCallback((id: string): Cliente | undefined => {
    return clientes.find(c => c.id === id);
  }, [clientes]);

  const searchClientes = useCallback((searchTerm: string): Cliente[] => {
    if (!searchTerm.trim()) return clientes;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return clientes.filter(
      cliente =>
        cliente.nome.toLowerCase().includes(lowerSearchTerm) ||
        (cliente.telefone && cliente.telefone.replace(/\D/g, '').includes(lowerSearchTerm.replace(/\D/g, '')))
    );
  }, [clientes]);


  return {
    clientes,
    loading,
    loadClientes,
    createCliente,
    updateCliente,
    removeCliente,
    getClienteById,
    searchClientes,
  };
}
