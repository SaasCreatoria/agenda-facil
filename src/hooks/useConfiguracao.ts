
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConfiguracaoEmpresa } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_CONFIG: ConfiguracaoEmpresa = {
  nomeEmpresa: 'Agenda Fácil',
  logoBase64: '',
  fusoHorario: 'America/Sao_Paulo',
  antecedenciaLembreteHoras: 24,
  canalLembretePadrao: 'EMAIL',
  zapiInstancia: '', 
  zapiToken: '', 
  publicPageTitle: 'Agende seu Horário',
  publicPageWelcomeMessage: 'Rápido, fácil e seguro.',
  publicPagePrimaryColor: '', 
  publicPageAccentColor: '', 
  criadoEm: new Date().toISOString(), 
  atualizadoEm: new Date().toISOString(), 
};

const CONFIG_DOC_ID = 'main'; // Static ID for the user's configuration document

export function useConfiguracao() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEmpresa>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadConfiguracao = useCallback(async () => {
    if (!user) {
      setConfiguracao(DEFAULT_CONFIG);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const configDocRef = doc(db, 'users', user.uid, 'configuracao', CONFIG_DOC_ID);
      const docSnap = await getDoc(configDocRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as Partial<ConfiguracaoEmpresa>;
        const mergedConfig = { 
          ...DEFAULT_CONFIG, 
          ...firestoreData,
          criadoEm: firestoreData.criadoEm && firestoreData.criadoEm.toDate ? firestoreData.criadoEm.toDate().toISOString() : DEFAULT_CONFIG.criadoEm,
          atualizadoEm: firestoreData.atualizadoEm && firestoreData.atualizadoEm.toDate ? firestoreData.atualizadoEm.toDate().toISOString() : DEFAULT_CONFIG.atualizadoEm,
        };
        setConfiguracao(mergedConfig);
      } else {
        const initialConfigToSave = {
          ...DEFAULT_CONFIG,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        };
        await setDoc(configDocRef, initialConfigToSave);
        setConfiguracao({
            ...DEFAULT_CONFIG,
            criadoEm: new Date().toISOString(), 
            atualizadoEm: new Date().toISOString(), 
        }); 
        console.log("Default configuration saved to Firestore for user:", user.uid);
      }
    } catch (error) {
      console.error('Error loading configuration from Firestore:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar configuração', description: (error as Error).message });
      setConfiguracao(DEFAULT_CONFIG); 
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadConfiguracao();
  }, [loadConfiguracao, user]); 

  const updateConfiguracao = async (newConfig: Partial<Omit<ConfiguracaoEmpresa, 'criadoEm' | 'atualizadoEm'>>): Promise<void> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para salvar configurações.' });
      return;
    }
    try {
      const configDocRef = doc(db, 'users', user.uid, 'configuracao', CONFIG_DOC_ID);
      const configToUpdate = {
        ...newConfig,
        atualizadoEm: serverTimestamp(),
      };
      await setDoc(configDocRef, configToUpdate, { merge: true });
      
      setConfiguracao(prev => ({ 
        ...prev, 
        ...newConfig,
        atualizadoEm: new Date().toISOString() 
      }));
      toast({ title: 'Configuração salva', description: 'Suas configurações foram atualizadas.' });
    } catch (error) {
      console.error('Error updating configuration in Firestore:', error);
      toast({ variant: 'destructive', title: 'Erro ao salvar configuração', description: (error as Error).message });
    }
  };

  return {
    configuracao,
    loadingConfiguracao: loading, 
    loadConfiguracao,
    updateConfiguracao,
  };
}

