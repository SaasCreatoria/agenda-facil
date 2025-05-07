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
  criadoEm: string; // ISO string
  atualizadoEm: string; // ISO string
}

export interface Servico extends Identifiable {
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  // criadoEm: string; // ISO string - Optional, depending on if needed
  // atualizadoEm: string; // ISO string - Optional
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
  // criadoEm: string; // Optional
  // atualizadoEm: string; // Optional
}

export interface Cliente extends Identifiable {
  nome: string;
  email?: string;
  telefone: string;
  dataNascimento?: string; // ISO string for date
  observacoes?: string;
  // criadoEm: string; // Optional
  // atualizadoEm: string; // Optional
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
}

// DTOs for creation - excluding id and audit fields
export type AgendamentoCreateDto = Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm' | 'clienteNome' | 'profissionalNome' | 'servicoNome'>;
export type ServicoCreateDto = Omit<Servico, 'id'>;
export type ProfissionalCreateDto = Omit<Profissional, 'id'>;
export type ClienteCreateDto = Omit<Cliente, 'id'>;
export type LembreteCreateDto = Omit<Lembrete, 'id' | 'criadoEm' | 'atualizadoEm'>;