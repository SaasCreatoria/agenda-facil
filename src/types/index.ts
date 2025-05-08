
export interface Identifiable {
  id: string;
}

export type AgendamentoStatus = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
export type LembreteTipo = 'EMAIL' | 'SMS' | 'WHATSAPP';
export type LembreteStatus = 'PENDENTE' | 'ENVIADO' | 'FALHOU';

export interface Agendamento extends Identifiable {
  clienteId: string;
  clienteNome?: string; // Denormalized for easier display
  profissionalId: string;
  profissionalNome?: string; // Denormalized
  servicoId: string;
  servicoNome?: string; // Denormalized
  dataHora: string; // ISO string for date and time
  duracaoMinutos: number;
  observacoes?: string;
  status: AgendamentoStatus;
  criadoEm: string | any; // ISO string in app state, Firestore Timestamp on write
  atualizadoEm: string | any; // ISO string in app state, Firestore Timestamp on write
}

export interface Servico extends Identifiable {
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  criadoEm: any; // Timestamp for Firestore
  atualizadoEm: any; // Timestamp for Firestore
}

export interface HorarioDisponivel {
  diaSemana: number; // 0 for Sunday, 1 for Monday, etc.
  inicio: string; // HH:mm format
  fim: string; // HH:mm format
}

export interface Profissional extends Identifiable {
  nome: string;
  email?: string;
  telefone?: string;
  servicosIds: string[];
  horariosDisponiveis: HorarioDisponivel[];
  ativo: boolean;
  criadoEm?: any; // Timestamp for Firestore
  atualizadoEm?: any; // Timestamp for Firestore
}

export interface Cliente extends Identifiable {
  nome: string;
  email?: string;
  telefone: string; // Store as digits only after validation
  dataNascimento?: string; // ISO string for date
  observacoes?: string;
  criadoEm: any; // Timestamp for Firestore
  atualizadoEm: any; // Timestamp for Firestore
}

export interface Lembrete extends Identifiable {
  agendamentoId: string;
  tipo: LembreteTipo;
  dataEnvioAgendado: string; // ISO string
  status: LembreteStatus;
  mensagem?: string;
  criadoEm: string; // ISO string
  atualizadoEm: string; // ISO string
}

export interface ConfiguracaoEmpresa {
  nomeEmpresa: string;
  logoBase64?: string;
  fusoHorario: string; // IANA timezone name e.g., "America/Sao_Paulo"
  antecedenciaLembreteHoras: number; // e.g., 24 for 24 hours before
  canalLembretePadrao: LembreteTipo;
  // Z-API Integration
  zapiInstancia?: string; 
  zapiToken?: string;
  // Public page customization
  publicPageTitle?: string;
  publicPageWelcomeMessage?: string;
  publicPagePrimaryColor?: string; // HSL string, e.g., "210 40% 96%"
  publicPageAccentColor?: string; // HSL string
  criadoEm?: any; // Timestamp for Firestore
  atualizadoEm?: any; // Timestamp for Firestore
}

// DTOs for creation - excluding id and audit fields
export type AgendamentoCreateDto = Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm' | 'clienteNome' | 'profissionalNome' | 'servicoNome'>;
export type ServicoCreateDto = Omit<Servico, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type ProfissionalCreateDto = Omit<Profissional, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type ClienteCreateDto = Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type LembreteCreateDto = Omit<Lembrete, 'id' | 'criadoEm' | 'atualizadoEm'>;

// DTO for updates
export type LembreteUpdateDto = Partial<Pick<Lembrete, 'tipo' | 'dataEnvioAgendado' | 'mensagem' | 'status'>>;


