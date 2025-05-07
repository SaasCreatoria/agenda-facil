import type { Agendamento, Servico } from '@/types';

/**
 * Checks if a new or updated agendamento conflicts with existing ones for the same professional.
 * @param agendamentoParaVerificar The agendamento to check (can be new or an update).
 * @param existingAgendamentos List of all existing agendamentos.
 * @param allServicos List of all servicos (to get durations).
 * @returns The conflicting Agendamento object if a conflict is found, otherwise null.
 */
export function checkConflict(
  agendamentoParaVerificar: Pick<Agendamento, 'dataHora' | 'profissionalId' | 'servicoId' | 'id' | 'duracaoMinutos'>,
  existingAgendamentos: Agendamento[]
): Agendamento | null {
  
  const newStartTime = new Date(agendamentoParaVerificar.dataHora);
  // Duration is now expected to be on agendamentoParaVerificar, or fetched if only servicoId is given initially.
  // For simplicity, assuming duracaoMinutos is passed directly or pre-filled on agendamentoParaVerificar.
  const newEndTime = new Date(newStartTime.getTime() + agendamentoParaVerificar.duracaoMinutos * 60000);

  for (const existing of existingAgendamentos) {
    // Skip if it's the same agendamento being edited and IDs match
    if (agendamentoParaVerificar.id && existing.id === agendamentoParaVerificar.id) {
      continue;
    }

    // Check only for the same professional
    if (existing.profissionalId !== agendamentoParaVerificar.profissionalId) {
      continue;
    }

    // Skip if existing appointment is cancelled
    if (existing.status === 'CANCELADO') {
      continue;
    }

    const existingStartTime = new Date(existing.dataHora);
    const existingEndTime = new Date(existingStartTime.getTime() + existing.duracaoMinutos * 60000);

    // Check for overlap:
    // (StartA <= EndB) and (EndA >= StartB)
    const hasOverlap = newStartTime < existingEndTime && newEndTime > existingStartTime;

    if (hasOverlap) {
      return existing; // Conflict found
    }
  }

  return null; // No conflict
}