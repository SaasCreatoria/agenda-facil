
export interface Identifiable {
  id: string;
}

export interface Agendamento extends Identifiable {
  clienteId: string;
  profissionalId: string;
  servicoId: string;
  dataHora: Date;
  duracaoMinutos: number; // Could be derived from Servico
  observacoes?: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Servico extends Identifiable {
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number; // Duration in minutes
  ativo: boolean;
}

export interface Profissional extends Identifiable {
  nome: string;
  email?: string;
  telefone?: string;
  servicosIds: string[]; // IDs of services they can perform
  horariosDisponiveis: { // Example: { diaSemana: 1 (Segunda), inicio: "09:00", fim: "18:00" }
    diaSemana: number; // 0 for Sunday, 1 for Monday, etc.
    inicio: string; // HH:mm format
    fim: string; // HH:mm format
  }[];
  ativo: boolean;
}

export interface Cliente extends Identifiable {
  nome: string;
  email?: string;
  telefone: string;
  dataNascimento?: Date;
  observacoes?: string;
}

export interface Lembrete extends Identifiable {
  agendamentoId: string;
  tipo: 'EMAIL' | 'SMS' | 'WHATSAPP'; // Example types
  dataEnvioAgendado: Date;
  status: 'PENDENTE' | 'ENVIADO' | 'FALHOU';
  mensagem?: string;
}

export interface ConfiguracaoEmpresa {
  nomeEmpresa?: string;
  logoBase64?: string;
  fusoHorario?: string; // IANA timezone name e.g., "America/Sao_Paulo"
  antecedenciaLembreteHoras?: number; // e.g., 24 for 24 hours before
  canalLembretePadrao?: Lembrete['tipo'];
}
