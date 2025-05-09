
'use client';

import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/shared/page-header';
import CalendarControls from '@/components/calendario/calendar-controls';
import CalendarDayView from '@/components/calendario/calendar-day-view';
import CalendarWeekView from '@/components/calendario/calendar-week-view';
import CalendarMonthView from '@/components/calendario/calendar-month-view';
import { useAppContext } from '@/contexts/app-context';
import type { Agendamento, AgendamentoCreateDto, Profissional, Servico } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AgendaForm from '@/components/agendamentos/agenda-form';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export type CalendarViewMode = 'day' | 'week' | 'month';

export default function CalendarioPage() {
  const { 
    agendamentos, 
    loadingAgendamentos, 
    profissionais, 
    loadingProfissionais, 
    servicos, 
    loadingServicos,
    clientes,
    loadingClientes,
    createAgendamento,
    updateAgendamento,
    configuracao,
    loadingConfiguracao
  } = useAppContext();

  const [currentDate, setCurrentDate] = useState<Date>(startOfToday());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
  const [selectedProfissionalIds, setSelectedProfissionalIds] = useState<string[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | undefined>(undefined);
  const [formInitialData, setFormInitialData] = useState<Partial<AgendamentoCreateDto> | undefined>(undefined);

  const activeProfissionais = useMemo(() => profissionais.filter(p => p.ativo), [profissionais]);

  const filteredProfissionais = useMemo(() => {
    if (selectedProfissionalIds.length === 0) {
      return activeProfissionais;
    }
    return activeProfissionais.filter(p => selectedProfissionalIds.includes(p.id));
  }, [activeProfissionais, selectedProfissionalIds]);

  const handleOpenForm = useCallback((agendamento?: Agendamento, initialSlotData?: Partial<AgendamentoCreateDto>) => {
    setEditingAgendamento(agendamento);
    if (agendamento) {
      const dataHoraUTC = new Date(agendamento.dataHora);
      const dataHoraLocal = new Date(dataHoraUTC.getTime() - dataHoraUTC.getTimezoneOffset() * -60000).toISOString().substring(0, 16);
      setFormInitialData({ ...agendamento, dataHora: dataHoraLocal });
    } else if (initialSlotData) {
       const dataHoraUTC = new Date(initialSlotData.dataHora!);
       const dataHoraLocal = new Date(dataHoraUTC.getTime() - dataHoraUTC.getTimezoneOffset() * -60000).toISOString().substring(0, 16);
       setFormInitialData({ ...initialSlotData, dataHora: dataHoraLocal });
    } else {
      setFormInitialData({ dataHora: startOfToday().toISOString().substring(0,10) + "T09:00"});
    }
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = () => {
    setEditingAgendamento(undefined);
    setFormInitialData(undefined);
    setIsFormOpen(false);
  };

  const handleSubmitForm = async (data: AgendamentoCreateDto | Agendamento) => {
    let success = false;
    if (editingAgendamento) {
      const result = await updateAgendamento(editingAgendamento.id, data as Partial<Omit<Agendamento, 'id' | 'criadoEm'>>);
      success = !!result;
    } else {
      const result = await createAgendamento(data as AgendamentoCreateDto);
      success = !!result;
    }
    if (success) {
      handleCloseForm();
    }
  };
  
  const isLoading = loadingAgendamentos || loadingProfissionais || loadingServicos || loadingClientes || loadingConfiguracao;

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(startOfToday());
      return;
    }
    const newDate = direction === 'prev' 
      ? (viewMode === 'day' ? subDays(currentDate, 1) : viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))
      : (viewMode === 'day' ? addDays(currentDate, 1) : viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
    setCurrentDate(newDate);
  };
  
  const dateRange = useMemo(() => {
    if (viewMode === 'day') return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    // Week starts on Monday (1) for pt-BR usually
    if (viewMode === 'week') return { start: startOfWeek(currentDate, { weekStartsOn: configuracao.fusoHorario === 'America/Sao_Paulo' ? 1:0 }), end: endOfWeek(currentDate, { weekStartsOn: configuracao.fusoHorario === 'America/Sao_Paulo' ? 1:0 }) };
    if (viewMode === 'month') return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    return { start: currentDate, end: currentDate };
  }, [currentDate, viewMode, configuracao.fusoHorario]);

  const agendamentosInView = useMemo(() => {
    return agendamentos.filter(ag => {
      const agDate = new Date(ag.dataHora);
      const isInDateRange = agDate >= dateRange.start && agDate <= dateRange.end;
      const isProfissionalMatch = selectedProfissionalIds.length === 0 || selectedProfissionalIds.includes(ag.profissionalId);
      return isInDateRange && isProfissionalMatch && ag.status !== 'CANCELADO';
    });
  }, [agendamentos, dateRange, selectedProfissionalIds]);

  const handleMonthDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const renderView = () => {
    if (isLoading) {
      return <Skeleton className="h-[600px] w-full" />;
    }
    switch (viewMode) {
      case 'day':
        return <CalendarDayView 
                  date={currentDate} 
                  agendamentos={agendamentosInView} // These are already filtered for the day and selected professionals
                  profissionais={filteredProfissionais} 
                  servicos={servicos}
                  configuracao={configuracao}
                  onEditAgendamento={handleOpenForm}
                  onCreateAgendamento={(slotData) => handleOpenForm(undefined, slotData)}
               />;
      case 'week':
        return <CalendarWeekView
                  currentDate={currentDate} // Pass the current date (any date in the week is fine)
                  agendamentos={agendamentosInView} // These are filtered for the week and selected professionals
                  profissionais={filteredProfissionais}
                  servicos={servicos}
                  configuracao={configuracao}
                  onEditAgendamento={handleOpenForm}
                  onCreateAgendamento={(slotData) => handleOpenForm(undefined, slotData)}
                />;
      case 'month':
        return <CalendarMonthView
                  currentDate={currentDate} // Pass the current date (any date in the month)
                  agendamentos={agendamentosInView} // Filtered for the month and selected professionals
                  onDayClick={handleMonthDayClick}
                  profissionais={filteredProfissionais} // Needed for appointment count per day
                />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader 
        title="Calendário" 
        description="Visualize e gerencie seus agendamentos de forma interativa."
        actions={
          <Button onClick={() => handleOpenForm()} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
          </Button>
        }
      />
      <CalendarControls
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigateDate={navigateDate}
        onSetViewMode={setViewMode}
        onSetCurrentDate={setCurrentDate}
        profissionais={activeProfissionais}
        selectedProfissionalIds={selectedProfissionalIds}
        onSetSelectedProfissionalIds={setSelectedProfissionalIds}
        isLoading={isLoading}
      />
      <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        {renderView()}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          </DialogHeader>
          {isFormOpen && !isLoading && (
            <AgendaForm 
              initialData={editingAgendamento || formInitialData as Agendamento}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
              servicos={servicos}
              profissionais={profissionais}
              clientes={clientes}
            />
          )}
           {isLoading && isFormOpen && (
             <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end space-x-2 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </>
  );
}

