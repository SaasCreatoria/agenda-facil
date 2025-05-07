'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConfiguracaoEmpresa } from '@/types';
import { LS_CONFIGURACAO_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_CONFIG: ConfiguracaoEmpresa = {
  nomeEmpresa: 'Agenda Fácil',
  logoBase64: '',
  fusoHorario: 'America/Sao_Paulo',
  antecedenciaLembreteHoras: 24,
  canalLembretePadrao: 'EMAIL',
};

export function useConfiguracao() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEmpresa>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadConfiguracao = useCallback(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const storedConfig = localStorage.getItem(LS_CONFIGURACAO_KEY);
        if (storedConfig) {
          setConfiguracao(JSON.parse(storedConfig));
        } else {
          setConfiguracao(DEFAULT_CONFIG);
          localStorage.setItem(LS_CONFIGURACAO_KEY, JSON.stringify(DEFAULT_CONFIG));
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        toast({ variant: 'destructive', title: 'Erro ao carregar configuração', description: (error as Error).message });
        setConfiguracao(DEFAULT_CONFIG); // Fallback to default
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadConfiguracao();
  }, [loadConfiguracao]);

  const updateConfiguracao = async (newConfig: Partial<ConfiguracaoEmpresa>): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        const updatedConfig = { ...configuracao, ...newConfig };
        setConfiguracao(updatedConfig);
        localStorage.setItem(LS_CONFIGURACAO_KEY, JSON.stringify(updatedConfig));
        toast({ title: 'Configuração salva', description: 'Suas configurações foram atualizadas.' });
      } catch (error) {
        console.error('Error updating configuration:', error);
        toast({ variant: 'destructive', title: 'Erro ao salvar configuração', description: (error as Error).message });
      }
    }
  };

  return {
    configuracao,
    loading,
    loadConfiguracao,
    updateConfiguracao,
  };
}