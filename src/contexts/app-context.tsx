
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { Agendamento, Servico, Profissional, Cliente, Lembrete, ConfiguracaoEmpresa, AgendamentoCreateDto, ServicoCreateDto, ProfissionalCreateDto, ClienteCreateDto, LembreteUpdateDto, Testimonial, TestimonialCreateDto } from '@/types';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { useServicos } from '@/hooks/useServicos';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useClientes } from '@/hooks/useClientes';
import { useLembretes } from '@/hooks/useLembretes';
import { useConfiguracao } from '@/hooks/useConfiguracao';
import { useTestimonials } from '@/hooks/useTestimonials'; // Import useTestimonials

interface AppContextType {
  // Agendamentos
  agendamentos: Agendamento[];
  loadingAgendamentos: boolean;
  loadAgendamentos: () => void;
  createAgendamento: (data: AgendamentoCreateDto) => Promise<Agendamento | null>;
  updateAgendamento: (id: string, updates: Partial<Omit<Agendamento, 'id' | 'criadoEm'>>) => Promise<Agendamento | null>;
  removeAgendamento: (id: string) => Promise<boolean>;
  getAgendamentoById: (id: string) => Agendamento | undefined;

  // Serviços
  servicos: Servico[];
  loadingServicos: boolean;
  loadServicos: () => void;
  createServico: (data: ServicoCreateDto) => Promise<Servico | null>;
  updateServico: (id: string, updates: Partial<Omit<Servico, 'id'>>) => Promise<Servico | null>;
  removeServico: (id: string) => Promise<boolean>;
  getServicoById: (id: string) => Servico | undefined;


  // Profissionais
  profissionais: Profissional[];
  loadingProfissionais: boolean;
  loadProfissionais: () => void;
  createProfissional: (data: ProfissionalCreateDto) => Promise<Profissional | null>;
  updateProfissional: (id: string, updates: Partial<Omit<Profissional, 'id'>>) => Promise<Profissional | null>;
  removeProfissional: (id: string) => Promise<boolean>;
  getProfissionalById: (id: string) => Profissional | undefined;

  // Clientes
  clientes: Cliente[];
  loadingClientes: boolean;
  loadClientes: () => void;
  createCliente: (data: ClienteCreateDto) => Promise<Cliente | null>;
  updateCliente: (id: string, updates: Partial<Omit<Cliente, 'id'>>) => Promise<Cliente | null>;
  removeCliente: (id: string) => Promise<boolean>;
  getClienteById: (id: string) => Cliente | undefined;
  searchClientes: (searchTerm: string) => Cliente[];

  // Lembretes
  lembretes: Lembrete[];
  loadingLembretes: boolean;
  loadLembretes: () => void;
  createLembreteContext: (agendamento: Agendamento, config: ConfiguracaoEmpresa) => Promise<Lembrete | null>;
  updateLembreteStatus: (id: string, status: Lembrete['status']) => Promise<Lembrete | null>;
  updateLembrete: (id: string, updates: LembreteUpdateDto) => Promise<Lembrete | null>; 
  removeLembrete: (id: string) => Promise<boolean>;
  getLembreteById: (id: string) => Lembrete | undefined;
  sendReminder: (lembrete: Lembrete) => Promise<void>;

  // Configuração
  configuracao: ConfiguracaoEmpresa;
  loadingConfiguracao: boolean;
  loadConfiguracao: () => void;
  updateConfiguracao: (newConfig: Partial<ConfiguracaoEmpresa>) => Promise<void>;

  // Testimonials (for admin management)
  testimonials: Testimonial[];
  loadingTestimonials: boolean;
  loadTestimonials: () => void; // Will load for the logged-in user's empresaId
  createTestimonial: (data: TestimonialCreateDto) => Promise<Testimonial | null>;
  updateTestimonial: (id: string, updates: Partial<Omit<Testimonial, 'id' | 'empresaId' | 'data'>>) => Promise<Testimonial | null>;
  removeTestimonial: (id: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const configuracaoState = useConfiguracao();
  const servicosState = useServicos();
  const profissionaisState = useProfissionais();
  const clientesState = useClientes();
  const lembretesState = useLembretes();
  const testimonialsState = useTestimonials(); // Loads testimonials for logged-in user by default

  const agendamentoServices = useMemo(() => ({
    createLembrete: lembretesState.createLembrete,
    getServicoById: servicosState.getServicoById,
    getProfissionalById: profissionaisState.getProfissionalById,
    getClienteById: clientesState.getClienteById,
  }), [
    lembretesState.createLembrete,
    servicosState.getServicoById,
    profissionaisState.getProfissionalById,
    clientesState.getClienteById,
  ]);
  
  const agendamentosState = useAgendamentos(agendamentoServices);

  const createAgendamentoWithConfig = (data: AgendamentoCreateDto) => {
    return agendamentosState.createAgendamento(data, configuracaoState.configuracao);
  };
  const updateAgendamentoWithConfig = (id: string, updates: Partial<Omit<Agendamento, 'id' | 'criadoEm'>>) => {
    return agendamentosState.updateAgendamento(id, updates, configuracaoState.configuracao);
  };
  
  useEffect(() => {
    if (lembretesState.loading || configuracaoState.loadingConfiguracao) return;

    const checkAndSendReminders = () => {
      const now = new Date();
      const lembreteToSend = lembretesState.lembretes.find(lembrete => 
        lembrete.status === 'PENDENTE' && 
        new Date(lembrete.dataEnvioAgendado).getTime() <= now.getTime()
      );

      if (lembreteToSend) {
        lembretesState.sendReminder(lembreteToSend); 
      }
    };

    checkAndSendReminders(); 
    const intervalId = setInterval(checkAndSendReminders, 5 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, [lembretesState.lembretes, lembretesState.sendReminder, lembretesState.loading, configuracaoState.loadingConfiguracao, configuracaoState.configuracao.fusoHorario]);


  const contextValue: AppContextType = {
    agendamentos: agendamentosState.agendamentos,
    loadingAgendamentos: agendamentosState.loading,
    loadAgendamentos: agendamentosState.loadAgendamentos,
    createAgendamento: createAgendamentoWithConfig,
    updateAgendamento: updateAgendamentoWithConfig,
    removeAgendamento: agendamentosState.removeAgendamento,
    getAgendamentoById: agendamentosState.getAgendamentoById,

    servicos: servicosState.servicos,
    loadingServicos: servicosState.loading,
    loadServicos: servicosState.loadServicos,
    createServico: servicosState.createServico,
    updateServico: servicosState.updateServico,
    removeServico: servicosState.removeServico,
    getServicoById: servicosState.getServicoById,

    profissionais: profissionaisState.profissionais,
    loadingProfissionais: profissionaisState.loading,
    loadProfissionais: profissionaisState.loadProfissionais,
    createProfissional: profissionaisState.createProfissional,
    updateProfissional: profissionaisState.updateProfissional,
    removeProfissional: profissionaisState.removeProfissional,
    getProfissionalById: profissionaisState.getProfissionalById,

    clientes: clientesState.clientes,
    loadingClientes: clientesState.loading,
    loadClientes: clientesState.loadClientes,
    createCliente: clientesState.createCliente,
    updateCliente: clientesState.updateCliente,
    removeCliente: clientesState.removeCliente,
    getClienteById: clientesState.getClienteById,
    searchClientes: clientesState.searchClientes,

    lembretes: lembretesState.lembretes,
    loadingLembretes: lembretesState.loading,
    loadLembretes: lembretesState.loadLembretes,
    createLembreteContext: lembretesState.createLembrete,
    updateLembreteStatus: lembretesState.updateLembreteStatus,
    updateLembrete: lembretesState.updateLembrete, 
    removeLembrete: lembretesState.removeLembrete,
    getLembreteById: lembretesState.getLembreteById,
    sendReminder: lembretesState.sendReminder,

    configuracao: configuracaoState.configuracao,
    loadingConfiguracao: configuracaoState.loadingConfiguracao, 
    loadConfiguracao: configuracaoState.loadConfiguracao,
    updateConfiguracao: configuracaoState.updateConfiguracao,

    testimonials: testimonialsState.testimonials,
    loadingTestimonials: testimonialsState.loadingTestimonials,
    loadTestimonials: testimonialsState.loadTestimonials,
    createTestimonial: testimonialsState.createTestimonial,
    updateTestimonial: testimonialsState.updateTestimonial,
    removeTestimonial: testimonialsState.removeTestimonial,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
