
'use client';

import type { Agendamento, AgendamentoCreateDto, Profissional, Servico, ConfiguracaoEmpresa } from '@/types';
import AppointmentEventCard from './appointment-event-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format, setHours, setMinutes, addMinutes, getHours, getMinutes, isBefore, isEqual, isAfter } from 'date-fns';

interface CalendarDayViewProps {
  date: Date;
  agendamentos: Agendamento[];
  profissionais: Profissional[];
  servicos: Servico[];
  configuracao: ConfiguracaoEmpresa;
  onEditAgendamento: (agendamento: Agendamento) => void;
  onCreateAgendamento: (slotData: Partial<AgendamentoCreateDto>) => void;
}

const HOUR_HEIGHT_PX = 60; // Height of one hour slot in pixels
const SLOT_DURATION_MINUTES = 30; // Duration of each time slot

// Define typical business hours or derive from profissional.horariosDisponiveis
const START_HOUR = 8;
const END_HOUR = 19; // Display up to 19:00, so last slot is 18:30-19:00

export default function CalendarDayView({
  date,
  agendamentos,
  profissionais,
  servicos,
  configuracao,
  onEditAgendamento,
  onCreateAgendamento,
}: CalendarDayViewProps) {

  const timeSlots = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    timeSlots.push(format(setMinutes(setHours(date, hour), 0), 'HH:mm'));
    // timeSlots.push(format(setMinutes(setHours(date, hour), 30), 'HH:mm')); // If 30-min labels
  }

  const getProfessionalColorClass = (index: number): string => {
    const colors = [
      'bg-[hsl(var(--chart-1))]',
      'bg-[hsl(var(--chart-2))]',
      'bg-[hsl(var(--chart-3))]',
      'bg-[hsl(var(--chart-4))]',
      'bg-[hsl(var(--chart-5))]',
      'bg-sky-500', // fallback if more than 5 professionals
      'bg-emerald-500',
      'bg-rose-500',
    ];
    return colors[index % colors.length];
  };

  const handleSlotClick = (time: string, profissionalId: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const slotDateTime = setMinutes(setHours(date, hour), minute);
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
      <div className="flex min-w-max"> {/* Ensure content doesn't wrap and becomes scrollable */}
        {/* Time Column */}
        <div className="sticky left-0 z-10 flex-none w-16 sm:w-20 bg-card border-r">
          <div className="h-16 sm:h-20 border-b flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground sticky top-0 bg-card z-10">
            Hora
          </div>
          {timeSlots.map((time, idx) => (
            <div 
              key={`time-${time}`} 
              className="h-[60px] flex items-center justify-center text-xs border-t text-muted-foreground"
              style={{ height: `${HOUR_HEIGHT_PX}px`}}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Professional Columns */}
        {profissionais.map((prof, profIndex) => (
          <div key={prof.id} className="flex-1 min-w-[180px] sm:min-w-[220px] border-r relative"> {/* Added relative for positioning appointments */}
            {/* Professional Header */}
            <div className="h-16 sm:h-20 border-b flex flex-col items-center justify-center p-1 sticky top-0 bg-card z-10">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mb-0.5 sm:mb-1">
                <AvatarImage src={`https://picsum.photos/seed/${prof.id.substring(0,5)}/40/40`} alt={prof.nome} data-ai-hint="person avatar" />
                <AvatarFallback>{prof.nome.substring(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium truncate max-w-full">{prof.nome}</span>
            </div>

            {/* Appointment Slots for this professional */}
            <div className="relative"> {/* This div is the actual column for placing appointments */}
              {timeSlots.map((time, slotIdx) => {
                 const [hourStr, minuteStr] = time.split(':');
                 const slotStartTime = setMinutes(setHours(date, parseInt(hourStr)), parseInt(minuteStr));
                 return (
                    <div
                        key={`slot-${prof.id}-${time}`}
                        className="border-t cursor-pointer hover:bg-muted/50"
                        style={{ height: `${HOUR_HEIGHT_PX}px`}}
                        onClick={() => handleSlotClick(time, prof.id)}
                        role="button"
                        aria-label={`Agendar com ${prof.nome} às ${time}`}
                    >
                        {/* Empty slot, content rendered via positioned AppointmentEventCard */}
                    </div>
                 );
              })}

              {/* Render Agendamentos for this professional */}
              {agendamentos
                .filter(ag => ag.profissionalId === prof.id)
                .map(ag => {
                  const agStart = new Date(ag.dataHora);
                  const agEnd = addMinutes(agStart, ag.duracaoMinutos);

                  // Calculate top position based on start time relative to START_HOUR
                  const startMinutesOffset = (getHours(agStart) - START_HOUR) * 60 + getMinutes(agStart);
                  const topPosition = (startMinutesOffset / 60) * HOUR_HEIGHT_PX;
                  
                  // Calculate height based on duration
                  const durationRatio = ag.duracaoMinutos / 60; // Ratio of appointment duration to one hour
                  const height = durationRatio * HOUR_HEIGHT_PX;
                  
                  // Ensure appointment is within the displayed hours
                  const dayViewStart = setHours(date, START_HOUR);
                  const dayViewEnd = setHours(date, END_HOUR);
                  
                  if (isBefore(agEnd, dayViewStart) || isAfter(agStart, dayViewEnd)) {
                    return null; // Appointment is outside the visible range
                  }

                  return (
                    <AppointmentEventCard
                      key={ag.id}
                      agendamento={ag}
                      servicos={servicos}
                      configuracao={configuracao}
                      onClick={() => onEditAgendamento(ag)}
                      className={`${getProfessionalColorClass(profIndex)} text-primary-foreground`}
                      style={{
                        position: 'absolute',
                        top: `${topPosition}px`,
                        left: '2px', // Small offset from column border
                        right: '2px',
                        height: `${Math.max(height, HOUR_HEIGHT_PX / 2)}px`, // Min height for visibility
                        zIndex: 10, 
                      }}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
