
'use client';

import type { Agendamento, Profissional } from '@/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  getDay,
  isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CalendarMonthViewProps {
  currentDate: Date; // Any date within the month to display
  agendamentos: Agendamento[]; // Agendamentos filtered for the month and selected professionals
  profissionais: Profissional[]; // Selected professionals (used to count appointments)
  onDayClick: (date: Date) => void;
}

export default function CalendarMonthView({
  currentDate,
  agendamentos,
  profissionais,
  onDayClick,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // Assuming week starts on Sunday for typical month views, adjust if locale specific behavior is needed.
  // For ptBR, startOfWeek might default to Monday. Let's ensure Sunday start for wide compatibility of month view.
  const displayStartDate = startOfWeek(monthStart, { weekStartsOn: 0 }); 
  const displayEndDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: displayStartDate,
    end: displayEndDate,
  });

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getAppointmentsForDay = (day: Date) => {
    return agendamentos.filter(ag => 
      isSameDay(new Date(ag.dataHora), day) &&
      (profissionais.length === 0 || profissionais.some(p => p.id === ag.profissionalId))
    ).length;
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-px border-l border-t rounded-t-md overflow-hidden">
        {dayNames.map((dayName) => (
          <div key={dayName} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card border-b border-r">
            {dayName}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 gap-px border-l border-b border-r rounded-b-md overflow-hidden">
        {days.map((day) => {
          const appointmentsCount = getAppointmentsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "h-24 sm:h-28 p-1.5 sm:p-2 cursor-pointer relative transition-colors border-t border-r bg-card hover:bg-muted/50",
                !isSameMonth(day, currentDate) && "bg-muted/20 text-muted-foreground opacity-70 hover:bg-muted/40",
                isToday(day) && "bg-primary/10 border-primary"
              )}
              onClick={() => onDayClick(day)}
              role="button"
              aria-label={`Ver dia ${format(day, 'dd/MM/yyyy')}, ${appointmentsCount} agendamentos`}
            >
              <span className={cn("text-xs sm:text-sm", isToday(day) && "font-bold text-primary")}>
                {format(day, 'd')}
              </span>
              {appointmentsCount > 0 && (
                <Badge 
                    variant="secondary" 
                    className="absolute bottom-1 right-1 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5"
                    title={`${appointmentsCount} agendamento(s)`}
                >
                  {appointmentsCount}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
