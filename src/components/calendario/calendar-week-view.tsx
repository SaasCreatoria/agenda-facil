
'use client';

import type { Agendamento, AgendamentoCreateDto, Profissional, Servico, ConfiguracaoEmpresa } from '@/types';
import AppointmentEventCard from './appointment-event-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  format, 
  setHours, 
  setMinutes, 
  addMinutes, 
  getHours, 
  getMinutes, 
  isBefore, 
  isAfter, 
  startOfWeek, 
  addDays,
  isSameDay,
  getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react'; 

interface CalendarWeekViewProps {
  currentDate: Date; // Any date within the week to display
  agendamentos: Agendamento[]; // Agendamentos already filtered for the week and selected professionals
  profissionais: Profissional[]; // Selected professionals
  servicos: Servico[];
  configuracao: ConfiguracaoEmpresa;
  onEditAgendamento: (agendamento: Agendamento) => void;
  onCreateAgendamento: (slotData: Partial<AgendamentoCreateDto>) => void;
}

const HOUR_HEIGHT_PX = 60; // Height of one hour slot in pixels
const START_HOUR = 8;
const END_HOUR = 19; // Display up to 19:00

export default function CalendarWeekView({
  currentDate,
  agendamentos,
  profissionais,
  servicos,
  configuracao,
  onEditAgendamento,
  onCreateAgendamento,
}: CalendarWeekViewProps) {

  const weekStartsOn = configuracao.fusoHorario === 'America/Sao_Paulo' ? 1 : 0; // 1 for Monday, 0 for Sunday
  const daysOfWeek = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate, weekStartsOn]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push(format(setMinutes(setHours(currentDate, hour), 0), 'HH:mm'));
    }
    return slots;
  }, [currentDate]);

  const getProfessionalColorClass = (index: number, status: Agendamento['status']): string => {
    // Colors are now primarily handled by AppointmentEventCard based on status
    // This function can be kept for fallback or additional styling if needed.
    return ''; 
  };

  const handleSlotClick = (day: Date, time: string, profissionalId: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const slotDateTime = setMinutes(setHours(day, hour), minute);
    onCreateAgendamento({
      dataHora: slotDateTime.toISOString(),
      profissionalId: profissionalId,
    });
  };

  if (profissionais.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhum profissional selecionado ou cadastrado.</div>;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex min-w-max">
        {/* Time Column */}
        <div className="sticky left-0 z-20 flex-none w-16 sm:w-20 bg-card border-r">
          <div className="h-20 sm:h-24 border-b flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground sticky top-0 bg-card z-10">
            Hora
          </div>
          {timeSlots.map((time) => (
            <div
              key={`time-label-${time}`}
              className="h-[60px] flex items-center justify-center text-xs border-t text-muted-foreground"
              style={{ height: `${HOUR_HEIGHT_PX}px` }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {daysOfWeek.map((day, dayIndex) => (
          <div key={day.toISOString()} className="flex flex-col min-w-[calc(180px*var(--prof-count,1))] sm:min-w-[calc(220px*var(--prof-count,1))]" style={{'--prof-count': profissionais.length} as React.CSSProperties}>
            {/* Day Header */}
            <div className="h-10 border-b flex items-center justify-center p-1 sticky top-0 bg-card z-10 border-r">
              <span className="text-xs sm:text-sm font-medium text-center">
                {format(day, 'EEE', { locale: ptBR })}<br />
                {format(day, 'dd/MM')}
              </span>
            </div>
            
            <div className="flex flex-1">
            {profissionais.map((prof, profIndex) => (
              <div key={`${day.toISOString()}-${prof.id}`} className="flex-1 min-w-[180px] sm:min-w-[220px] border-r relative">
                {/* Professional Header (within day) */}
                <div className="h-10 sm:h-14 border-b flex flex-col items-center justify-center p-1 sticky top-10 bg-card z-10">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage src={`https://picsum.photos/seed/${prof.id.substring(0,5)}/40/40`} alt={prof.nome} data-ai-hint="person avatar" />
                    <AvatarFallback>{prof.nome.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] sm:text-xs font-medium truncate max-w-full mt-0.5">{prof.nome}</span>
                </div>

                {/* Appointment Slots for this professional & day */}
                <div className="relative">
                  {timeSlots.map((time) => {
                    const slotStartTime = setMinutes(setHours(day, parseInt(time.split(':')[0])), parseInt(time.split(':')[1]));
                     const professionalAvailability = prof.horariosDisponiveis.find(
                        h => h.diaSemana === getDay(day) 
                    );
                    let isAvailableSlot = false;
                    if (professionalAvailability) {
                        const availabilityStart = setMinutes(setHours(day, parseInt(professionalAvailability.inicio.split(':')[0])), parseInt(professionalAvailability.inicio.split(':')[1]));
                        const availabilityEnd = setMinutes(setHours(day, parseInt(professionalAvailability.fim.split(':')[0])), parseInt(professionalAvailability.fim.split(':')[1]));
                        if(slotStartTime >= availabilityStart && slotStartTime < availabilityEnd){
                            isAvailableSlot = true;
                        }
                    }

                    return (
                      <div
                        key={`slot-${prof.id}-${day.toISOString()}-${time}`}
                        className={`border-t cursor-pointer ${isAvailableSlot ? 'hover:bg-muted/50' : 'bg-muted/30 cursor-not-allowed'}`}
                        style={{ height: `${HOUR_HEIGHT_PX}px` }}
                        onClick={() => isAvailableSlot && handleSlotClick(day, time, prof.id)}
                        role="button"
                        aria-label={isAvailableSlot ? `Agendar com ${prof.nome} às ${time} em ${format(day, 'dd/MM')}` : `Horário indisponível`}
                      />
                    );
                  })}

                  {agendamentos
                    .filter(ag => ag.profissionalId === prof.id && isSameDay(new Date(ag.dataHora), day))
                    .map(ag => {
                      const agStart = new Date(ag.dataHora);
                      const startMinutesOffset = (getHours(agStart) - START_HOUR) * 60 + getMinutes(agStart);
                      const topPosition = (startMinutesOffset / 60) * HOUR_HEIGHT_PX;
                      const durationRatio = ag.duracaoMinutos / 60;
                      const height = durationRatio * HOUR_HEIGHT_PX;
                      
                      const dayViewStart = setHours(day, START_HOUR);
                      const dayViewEnd = setHours(day, END_HOUR);
                      const agEnd = addMinutes(agStart, ag.duracaoMinutos);
                       if (isBefore(agEnd, dayViewStart) || isAfter(agStart, dayViewEnd)) {
                        return null;
                      }

                      return (
                        <AppointmentEventCard
                          key={ag.id}
                          agendamento={ag}
                          servicos={servicos}
                          configuracao={configuracao}
                          onClick={() => onEditAgendamento(ag)}
                          className={getProfessionalColorClass(profIndex, ag.status)} // Pass status
                          style={{
                            position: 'absolute',
                            top: `${topPosition}px`,
                            left: '2px',
                            right: '2px',
                            height: `${Math.max(height, HOUR_HEIGHT_PX / 2)}px`,
                            zIndex: 10,
                          }}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

