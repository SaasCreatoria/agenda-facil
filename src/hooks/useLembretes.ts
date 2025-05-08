
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lembrete, LembreteCreateDto, LembreteUpdateDto, Agendamento, ConfiguracaoEmpresa, Cliente } from '@/types';
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
  where,
  getDoc
} from 'firebase/firestore';
import { formatDateTime } from '@/utils/helpers';

// Helper to format phone number for Z-API (E.164 format, assuming Brazil for now)
const formatPhoneNumberForZapi = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('55') && digitsOnly.length >= 12) { // E.g. 55119XXXXXXXX
    return digitsOnly;
  }
  return `55${digitsOnly}`; // Add Brazil country code if not present
};

export function useLembretes() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const denormalizeLembrete = (lembreteData: any): Lembrete => {
    return {
      ...lembreteData,
      id: lembreteData.id, 
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
  }, [loadLembretes, user]);

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
      dataEnvioAgendado: dataEnvioAgendado.toISOString(),
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
      const lembretesCollectionRef = collection(db, 'users', user.uid, 'lembretes');
      const q = query(lembretesCollectionRef, 
                      where("agendamentoId", "==", agendamento.id), 
                      where("status", "==", "PENDENTE"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        // Update existing pending reminder instead of creating a new one if date or type changed significantly
        const existingLembreteData = existingDoc.data();
        const updateNeeded = 
            new Date(lembreteDto.dataEnvioAgendado).getTime() !== (existingLembreteData.dataEnvioAgendado as Timestamp).toDate().getTime() ||
            lembreteDto.tipo !== existingLembreteData.tipo ||
            lembreteDto.mensagem !== existingLembreteData.mensagem;

        if (updateNeeded) {
            await updateDoc(existingDoc.ref, {
                dataEnvioAgendado: Timestamp.fromDate(new Date(lembreteDto.dataEnvioAgendado)),
                tipo: lembreteDto.tipo,
                mensagem: lembreteDto.mensagem,
                atualizadoEm: serverTimestamp()
            });
            const updatedLembrete = denormalizeLembrete({id: existingDoc.id, ...existingLembreteData, ...lembreteDto, atualizadoEm: new Date().toISOString()});
            setLembretes(prev => prev.map(l => l.id === updatedLembrete.id ? updatedLembrete : l).sort((a,b) => new Date(b.dataEnvioAgendado).getTime() - new Date(a.dataEnvioAgendado).getTime()));
            toast({ title: 'Lembrete Atualizado', description: `Lembrete pendente para agendamento atualizado.` });
            return updatedLembrete;
        } else {
            console.log(`Pending reminder for agendamento ${agendamento.id} already exists and is up-to-date.`);
            return denormalizeLembrete({ id: existingDoc.id, ...existingLembreteData });
        }
      }
      
      const docRef = await addDoc(lembretesCollectionRef, lembreteDataForFirestore);
      const newLembrete = denormalizeLembrete({
        id: docRef.id,
        ...lembreteDto,
        criadoEm: new Date().toISOString(), 
        atualizadoEm: new Date().toISOString()
      });
      
      setLembretes(prev => [...prev, newLembrete].sort((a,b) => new Date(b.dataEnvioAgendado).getTime() - new Date(a.dataEnvioAgendado).getTime()));
      toast({ title: 'Lembrete criado', description: `Lembrete para agendamento agendado.` });
      return newLembrete;
    } catch (error) {
      console.error('Error creating/updating lembrete:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar/atualizar lembrete', description: (error as Error).message });
      return null;
    }
  }, [user, toast]);

  const updateLembreteStatus = useCallback(async (id: string, status: Lembrete['status']): Promise<Lembrete | null> => {
    if (!user) {
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
          atualizadoEm: new Date().toISOString(),
        });
        setLembretes(prev => prev.map(l => (l.id === id ? updatedLembreteLocal : l)).sort((a,b) => new Date(b.dataEnvioAgendado).getTime() - new Date(a.dataEnvioAgendado).getTime()));
        return updatedLembreteLocal;
      }
      return null;
    } catch (error) {
      console.error('Error updating lembrete status:', error);
      throw error; 
    }
  }, [user, lembretes]);

  const updateLembrete = useCallback(async (id: string, updates: LembreteUpdateDto): Promise<Lembrete | null> => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para atualizar um lembrete.' });
        return null;
    }
    const lembreteDocRef = doc(db, 'users', user.uid, 'lembretes', id);
    const existingLembrete = lembretes.find(l => l.id === id);

    if (!existingLembrete) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Lembrete não encontrado.' });
        return null;
    }

    const updateDataForFirestore: any = { ...updates, atualizadoEm: serverTimestamp() };

    if (updates.dataEnvioAgendado) {
        updateDataForFirestore.dataEnvioAgendado = Timestamp.fromDate(new Date(updates.dataEnvioAgendado));
    }
    
    const newScheduledSendTime = updates.dataEnvioAgendado ? new Date(updates.dataEnvioAgendado).toISOString() : existingLembrete.dataEnvioAgendado;

    const needsStatusReset = (updates.dataEnvioAgendado && newScheduledSendTime !== existingLembrete.dataEnvioAgendado) ||
                             (updates.tipo && updates.tipo !== existingLembrete.tipo) ||
                             (updates.mensagem && updates.mensagem !== existingLembrete.mensagem);


    if (needsStatusReset && (existingLembrete.status === 'ENVIADO' || existingLembrete.status === 'FALHOU')) {
        updateDataForFirestore.status = 'PENDENTE';
    }


    try {
        await updateDoc(lembreteDocRef, updateDataForFirestore);
        const updatedLembreteLocal = denormalizeLembrete({
            ...existingLembrete,
            ...updates,
            status: updateDataForFirestore.status || existingLembrete.status, 
            atualizadoEm: new Date().toISOString(),
            // ensure dataEnvioAgendado is an ISO string locally if updated
            dataEnvioAgendado: newScheduledSendTime,
        });
        setLembretes(prev => prev.map(l => (l.id === id ? updatedLembreteLocal : l)).sort((a,b) => new Date(b.dataEnvioAgendado).getTime() - new Date(a.dataEnvioAgendado).getTime()));
        toast({ title: 'Lembrete Atualizado', description: 'O lembrete foi atualizado com sucesso.' });
        return updatedLembreteLocal;
    } catch (error) {
        console.error('Error updating lembrete:', error);
        toast({ variant: 'destructive', title: 'Erro ao Atualizar Lembrete', description: (error as Error).message });
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

    let success = false;
    let errorMessage: string | undefined;

    try {
      if (lembrete.tipo === 'WHATSAPP') {
        const configDocRef = doc(db, 'users', user.uid, 'configuracao', 'main');
        const configSnap = await getDoc(configDocRef);
        const configData = configSnap.data() as ConfiguracaoEmpresa | undefined;

        if (!configData?.zapiInstancia || !configData?.zapiToken) {
          errorMessage = 'Configurações da Z-API (Instância/Token) não encontradas ou inválidas.';
          throw new Error(errorMessage);
        }
        
        const zapiUrl = `https://api.z-api.io/instances/${configData.zapiInstancia}/token/${configData.zapiToken}/send-text`;

        const agendamentoDocRef = doc(db, 'users', user.uid, 'agendamentos', lembrete.agendamentoId);
        const agendamentoSnap = await getDoc(agendamentoDocRef);
        if (!agendamentoSnap.exists()) {
          errorMessage = 'Agendamento associado ao lembrete não encontrado.';
          throw new Error(errorMessage);
        }
        const agendamentoData = agendamentoSnap.data() as Agendamento;

        const clienteDocRef = doc(db, 'users', user.uid, 'clientes', agendamentoData.clienteId);
        const clienteSnap = await getDoc(clienteDocRef);
        if (!clienteSnap.exists()) {
             errorMessage = 'Cliente associado ao agendamento não encontrado.';
            throw new Error(errorMessage);
        }
        const clienteData = clienteSnap.data() as Cliente;
        
        const whatsappMessage = lembrete.mensagem || `Lembrete: Olá ${clienteData.nome}, seu agendamento para ${agendamentoData.servicoNome || 'serviço'} com ${agendamentoData.profissionalNome || 'profissional'} está marcado para ${formatDateTime(agendamentoData.dataHora)}. Atenciosamente, ${configData.nomeEmpresa || "Sua Empresa"}`;
        const formattedPhone = formatPhoneNumberForZapi(clienteData.telefone);

        const response = await fetch(zapiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formattedPhone,
            message: whatsappMessage,
          }),
        });

        if (!response.ok) {
            const errorBody = await response.json(); // Z-API usually returns JSON errors
            console.error("Z-API error response:", errorBody);
            errorMessage = `Falha ao enviar WhatsApp via Z-API: ${response.status} - ${errorBody?.error || errorBody?.value || 'Erro desconhecido da API'}`;
            throw new Error(errorMessage);
        }
        console.log("WhatsApp reminder sent via Z-API:", await response.json());
        success = true;

      } else if (lembrete.tipo === 'EMAIL') {
        console.log(`Simulating sending EMAIL reminder ${lembrete.id} with message: "${lembrete.mensagem}"`);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        success = Math.random() > 0.05; 
        if(!success) errorMessage = "Falha simulada no envio de Email.";
      
      } else if (lembrete.tipo === 'SMS') {
        console.warn(`SMS reminders are not currently supported. Lembrete ID: ${lembrete.id}`);
        errorMessage = `Envio de SMS não está implementado.`;
        success = false; 
      } else {
        console.warn(`Tipo de lembrete ${lembrete.tipo} não implementado para envio.`);
        errorMessage = `Tipo de lembrete ${lembrete.tipo} não suportado.`;
      }
    } catch (error: any) {
        console.error(`Error sending ${lembrete.tipo} reminder:`, error);
        errorMessage = errorMessage || error.message || "Erro desconhecido ao enviar lembrete."; 
        success = false;
    }
    
    const newStatus = success ? 'ENVIADO' : 'FALHOU';
    try {
        await updateLembreteStatus(lembrete.id, newStatus);
    } catch (updateError: any) {
        toast({
            title: `Lembrete ${success ? 'Enviado (falha ao atualizar status)' : 'Falhou'}`,
            description: (errorMessage || `Falha ao processar lembrete (${lembrete.tipo}).`) + ` Erro ao salvar status: ${updateError.message}`,
            variant: 'destructive'
        });
        return; 
    }

    toast({
        title: `Lembrete ${success ? 'Enviado' : 'Falhou'}`,
        description: success 
            ? `O lembrete (${lembrete.tipo}) para o agendamento foi processado.`
            : errorMessage || `Falha ao processar lembrete (${lembrete.tipo}).`,
        variant: success ? 'default' : 'destructive'
    });

  }, [user, toast, updateLembreteStatus]);

  return {
    lembretes,
    loading,
    loadLembretes,
    createLembrete,
    updateLembreteStatus,
    updateLembrete,
    removeLembrete,
    getLembreteById,
    sendReminder,
  };
}

