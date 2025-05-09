
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConfiguracaoEmpresa } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, query, collectionGroup, where, getDocs } from 'firebase/firestore';

const DEFAULT_CONFIG: Omit<ConfiguracaoEmpresa, 'criadoEm' | 'atualizadoEm' | 'publicPageSlug'> = {
  nomeEmpresa: 'Agenda Fácil',
  logoBase64: '',
  heroBannerBase64: '',
  fusoHorario: 'America/Sao_Paulo',
  antecedenciaLembreteHoras: 24,
  canalLembretePadrao: 'EMAIL',
  zapiInstancia: '', 
  zapiToken: '', 
  publicPageTitle: 'Agende seu Horário',
  publicPageWelcomeMessage: 'Rápido, fácil e seguro.',
  publicPagePrimaryColor: '', 
  publicPageAccentColor: '', 
};

const CONFIG_DOC_ID = 'main'; 

export function useConfiguracao() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEmpresa>({
    ...DEFAULT_CONFIG,
    publicPageSlug: '', // Initial empty slug
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadConfiguracao = useCallback(async () => {
    if (!user) {
      setConfiguracao({
        ...DEFAULT_CONFIG,
        publicPageSlug: '',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const configDocRef = doc(db, 'users', user.uid, 'configuracao', CONFIG_DOC_ID);
      const docSnap = await getDoc(configDocRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as Partial<ConfiguracaoEmpresa>;
        setConfiguracao({ 
          ...DEFAULT_CONFIG, 
          ...firestoreData,
          publicPageSlug: firestoreData.publicPageSlug || user.uid, // Fallback to UID if slug is empty
          criadoEm: firestoreData.criadoEm && firestoreData.criadoEm.toDate ? firestoreData.criadoEm.toDate().toISOString() : new Date().toISOString(),
          atualizadoEm: firestoreData.atualizadoEm && firestoreData.atualizadoEm.toDate ? firestoreData.atualizadoEm.toDate().toISOString() : new Date().toISOString(),
        });
      } else {
        // First time: set default config with user.uid as initial slug
        const initialConfigToSave = {
          ...DEFAULT_CONFIG,
          publicPageSlug: user.uid, // Default slug to user's UID
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        };
        await setDoc(configDocRef, initialConfigToSave);
        setConfiguracao({
            ...DEFAULT_CONFIG,
            publicPageSlug: user.uid,
            criadoEm: new Date().toISOString(), 
            atualizadoEm: new Date().toISOString(), 
        }); 
        console.log("Default configuration saved to Firestore for user:", user.uid);
      }
    } catch (error) {
      console.error('Error loading configuration from Firestore:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar configuração', description: (error as Error).message });
      setConfiguracao({
        ...DEFAULT_CONFIG,
        publicPageSlug: user?.uid || '', // Fallback if user is somehow null during error
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }); 
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
    
    const configToUpdate: any = { 
        ...newConfig,
        atualizadoEm: serverTimestamp(),
    };

    // Slug validation and uniqueness check
    if (newConfig.publicPageSlug !== undefined) {
      const newSlug = newConfig.publicPageSlug.trim().toLowerCase();
      // Basic slug format validation (already in form, but good to double check)
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (newSlug && (!slugRegex.test(newSlug) || newSlug.length < 3 || newSlug.length > 30)) {
          toast({ variant: 'destructive', title: 'Link Personalizado Inválido', description: 'Use 3-30 caracteres: letras minúsculas, números e hífens (não no início/fim, sem ser repetido).' });
          return;
      }

      if (newSlug && newSlug !== configuracao.publicPageSlug) {
        const q = query(collectionGroup(db, 'configuracao'), where("publicPageSlug", "==", newSlug));
        const querySnapshot = await getDocs(q);
        let slugTaken = false;
        querySnapshot.forEach((docSnap) => {
            // Check if the slug belongs to a different user
            if (docSnap.ref.parent.parent?.id !== user.uid) {
                slugTaken = true;
            }
        });
        if (slugTaken) {
            toast({ variant: 'destructive', title: 'Link Personalizado Indisponível', description: 'Este link já está em uso. Por favor, escolha outro.' });
            return; 
        }
        configToUpdate.publicPageSlug = newSlug;
      } else if (newSlug === '') { // Allow clearing the slug, which should revert to user.uid display logic
         configToUpdate.publicPageSlug = ''; // Save empty string to signify "no custom slug"
      }
    }


    try {
      const configDocRef = doc(db, 'users', user.uid, 'configuracao', CONFIG_DOC_ID);
      await setDoc(configDocRef, configToUpdate, { merge: true });
      
      // Update local state, ensuring slug reflects the final saved value (or user.uid if cleared)
      const finalSlug = configToUpdate.publicPageSlug === '' ? user.uid : (configToUpdate.publicPageSlug || configuracao.publicPageSlug || user.uid);

      setConfiguracao(prev => ({ 
        ...prev, 
        ...newConfig,
        publicPageSlug: finalSlug,
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

