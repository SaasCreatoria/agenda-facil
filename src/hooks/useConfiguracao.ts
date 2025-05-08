
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
  zapierWhatsappWebhookUrl: '', // Added field
  publicPageTitle: 'Agende seu Horário',
  publicPageWelcomeMessage: 'Rápido, fácil e seguro.',
  publicPagePrimaryColor: '', 
  publicPageAccentColor: '', 
  // Add criadoEm and atualizadoEm for consistency, though not strictly part of user-facing config
  criadoEm: new Date().toISOString(), // Placeholder, will be overwritten by serverTimestamp
  atualizadoEm: new Date().toISOString(), // Placeholder
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
        // Merge with defaults to ensure all fields are present, especially new ones not in Firestore yet
        const mergedConfig = { 
          ...DEFAULT_CONFIG, 
          ...firestoreData,
          // Ensure timestamps are properly converted if they exist
          criadoEm: firestoreData.criadoEm && firestoreData.criadoEm.toDate ? firestoreData.criadoEm.toDate().toISOString() : DEFAULT_CONFIG.criadoEm,
          atualizadoEm: firestoreData.atualizadoEm && firestoreData.atualizadoEm.toDate ? firestoreData.atualizadoEm.toDate().toISOString() : DEFAULT_CONFIG.atualizadoEm,
        };
        setConfiguracao(mergedConfig);
      } else {
        // No config in Firestore, save the default one
        const initialConfigToSave = {
          ...DEFAULT_CONFIG,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        };
        await setDoc(configDocRef, initialConfigToSave);
        setConfiguracao({
            ...DEFAULT_CONFIG,
            criadoEm: new Date().toISOString(), // client-side approximation
            atualizadoEm: new Date().toISOString(), // client-side approximation
        }); 
        console.log("Default configuration saved to Firestore for user:", user.uid);
      }
    } catch (error) {
      console.error('Error loading configuration from Firestore:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar configuração', description: (error as Error).message });
      setConfiguracao(DEFAULT_CONFIG); // Fallback to default
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadConfiguracao();
  }, [loadConfiguracao, user]); // Add user as dependency to reload when user changes

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
      
      // Update local state optimistically or after confirmation
      setConfiguracao(prev => ({ 
        ...prev, 
        ...newConfig,
        atualizadoEm: new Date().toISOString() // client-side approximation
      }));
      toast({ title: 'Configuração salva', description: 'Suas configurações foram atualizadas.' });
    } catch (error) {
      console.error('Error updating configuration in Firestore:', error);
      toast({ variant: 'destructive', title: 'Erro ao salvar configuração', description: (error as Error).message });
    }
  };

  return {
    configuracao,
    loadingConfiguracao: loading, // Renamed for clarity in AppContext
    loadConfiguracao,
    updateConfiguracao,
  };
}

