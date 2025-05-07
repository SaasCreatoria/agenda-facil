'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Cliente, ClienteCreateDto } from '@/types';
import * as storage from '@/services/storage';
import { LS_CLIENTES_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadClientes = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const data = storage.getAll<Cliente>(LS_CLIENTES_KEY);
        setClientes(data);
      } catch (error) {
        console.error('Error loading clientes:', error);
        toast({ variant: 'destructive', title: 'Erro ao carregar clientes', description: (error as Error).message });
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const createCliente = async (data: ClienteCreateDto): Promise<Cliente | null> => {
    // Validate unique phone (optional, but good for preventing duplicates)
    if (clientes.some(c => c.telefone === data.telefone)) {
        // Potentially allow duplicate phones but warn, or make it strict
        // toast({ variant: 'default', title: 'Atenção', description: 'Cliente com este telefone já existe. Criando novo registro.' });
    }
    try {
      const newCliente = storage.create<ClienteCreateDto, Cliente>(LS_CLIENTES_KEY, data);
      setClientes(prev => [...prev, newCliente]);
      toast({ title: 'Cliente criado', description: `Cliente "${newCliente.nome}" adicionado.` });
      return newCliente;
    } catch (error) {
      console.error('Error creating cliente:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar cliente', description: (error as Error).message });
      return null;
    }
  };

  const updateCliente = async (id: string, updates: Partial<Omit<Cliente, 'id'>>): Promise<Cliente | null> => {
     if (updates.telefone && clientes.some(c => c.id !== id && c.telefone === updates.telefone)) {
        //  toast({ variant: 'destructive', title: 'Erro ao atualizar cliente', description: 'Este telefone já está em uso por outro cliente.' });
        //  return null;
     }
    try {
      const updatedCliente = storage.update<Cliente>(LS_CLIENTES_KEY, id, updates);
      if (updatedCliente) {
        setClientes(prev => prev.map(c => (c.id === id ? updatedCliente : c)));
        toast({ title: 'Cliente atualizado', description: `Cliente "${updatedCliente.nome}" atualizado.` });
        return updatedCliente;
      }
      return null;
    } catch (error) {
      console.error('Error updating cliente:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar cliente', description: (error as Error).message });
      return null;
    }
  };

  const removeCliente = async (id: string): Promise<boolean> => {
    // Basic check: In a real app, check for future appointments with this cliente
    try {
      const success = storage.remove(LS_CLIENTES_KEY, id);
      if (success) {
        setClientes(prev => prev.filter(c => c.id !== id));
        toast({ title: 'Cliente removido', description: 'O cliente foi removido com sucesso.' });
      }
      return success;
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
        cliente.telefone.replace(/\D/g, '').includes(lowerSearchTerm.replace(/\D/g, ''))
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