
'use client';

import type { CalendarViewMode } from '@/app/(app)/calendario/page';
import type { Profissional } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, CalendarIcon, Users, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarControlsProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onNavigateDate: (direction: 'prev' | 'next' | 'today') => void;
  onSetViewMode: (mode: CalendarViewMode) => void;
  onSetCurrentDate: (date: Date) => void;
  profissionais: Profissional[];
  selectedProfissionalIds: string[];
  onSetSelectedProfissionalIds: (ids: string[]) => void;
  isLoading?: boolean;
}

export default function CalendarControls({
  currentDate,
  viewMode,
  onNavigateDate,
  onSetViewMode,
  onSetCurrentDate,
  profissionais,
  selectedProfissionalIds,
  onSetSelectedProfissionalIds,
  isLoading
}: CalendarControlsProps) {

  const handleProfessionalSelect = (profissionalId: string) => {
    const newSelectedIds = selectedProfissionalIds.includes(profissionalId)
      ? selectedProfissionalIds.filter(id => id !== profissionalId)
      : [...selectedProfissionalIds, profissionalId];
    onSetSelectedProfissionalIds(newSelectedIds);
  };

  const displayDateFormat = () => {
    if (viewMode === 'day') return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    if (viewMode === 'week') {
      const start = format(currentDate, "dd/MM", { locale: ptBR });
      const end = format(addDays(currentDate, 6), "dd/MM/yyyy", { locale: ptBR });
      return `Semana de ${start} a ${end}`;
    }
    if (viewMode === 'month') return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    return format(currentDate, "dd/MM/yyyy", { locale: ptBR });
  };
  
  // Helper function (can be moved to utils if needed elsewhere)
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }


  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-b bg-card rounded-t-lg">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigateDate('prev')} disabled={isLoading} aria-label="Data anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => onNavigateDate('today')} disabled={isLoading}>
          Hoje
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigateDate('next')} disabled={isLoading} aria-label="Próxima data">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal" disabled={isLoading}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(currentDate, "dd/MM/yyyy", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && onSetCurrentDate(date)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-sm sm:text-base font-medium text-center sm:text-left flex-1 min-w-0 px-2 truncate" title={displayDateFormat()}>
        {displayDateFormat()}
      </div>

      <div className="flex items-center gap-2">
        <Select value={viewMode} onValueChange={(value) => onSetViewMode(value as CalendarViewMode)} disabled={isLoading}>
          <SelectTrigger className="w-[100px] sm:w-[120px]">
            <SelectValue placeholder="Visualizar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Dia</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading || profissionais.length === 0}>
              <ListFilter className="mr-2 h-4 w-4" />
              Profissionais ({selectedProfissionalIds.length === 0 ? 'Todos' : selectedProfissionalIds.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
            <DropdownMenuLabel>Filtrar por Profissional</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profissionais.length > 0 ? (
              profissionais.map((prof) => (
                <DropdownMenuCheckboxItem
                  key={prof.id}
                  checked={selectedProfissionalIds.includes(prof.id)}
                  onCheckedChange={() => handleProfessionalSelect(prof.id)}
                >
                  {prof.nome}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Nenhum profissional cadastrado</DropdownMenuItem>
            )}
             {profissionais.length > 0 && selectedProfissionalIds.length > 0 && (
                <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSetSelectedProfissionalIds([])} className="text-destructive">
                    Limpar Seleção
                </DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

