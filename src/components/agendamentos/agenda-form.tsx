

'use client';

import type { Agendamento, AgendamentoCreateDto, Servico, Profissional, Cliente } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useEffect, useState, useCallback } from 'react';

type ValidationSchema = {
  clienteId: (value: string) => string | null;
  servicoId: (value: string) => string | null;
  profissionalId: (value: string) => string | null;
  dataHora: (value: string) => string | null;
  status: (value: string) => string | null;
};

const agendaValidationSchema: ValidationSchema = {
  clienteId: (value) => (value ? null : 'Cliente é obrigatório.'),
  servicoId: (value) => (value ? null : 'Serviço é obrigatório.'),
  profissionalId: (value) => (value ? null : 'Profissional é obrigatório.'),
  dataHora: (value) => {
    if (!value) return 'Data e hora são obrigatórios.';
    if (new Date(value) < new Date(new Date().setHours(0,0,0,0))) return 'A data não pode ser no passado.';
    return null;
  },
  status: (value) => (value ? null : 'Status é obrigatório.'),
};


interface AgendaFormProps {
  initialData?: Agendamento | Partial<AgendamentoCreateDto>; // Allow partial for calendar slot clicks
  onSubmit: (data: AgendamentoCreateDto | Agendamento) => Promise<void>;
  onCancel?: () => void;
  servicos: Servico[];
  profissionais: Profissional[];
  clientes: Cliente[];
}

export default function AgendaForm({ initialData, onSubmit, onCancel, servicos, profissionais, clientes }: AgendaFormProps) {
  const defaultDataHora = useCallback(() => {
      const now = new Date();
      // If it's for today, set to next available half-hour or hour, at least 1 hour in future
      // Otherwise, default to 09:00 of the provided date or tomorrow
      if (initialData?.dataHora && new Date(initialData.dataHora).toDateString() === now.toDateString()) {
        now.setHours(now.getHours() + 1);
        if (now.getMinutes() < 30) now.setMinutes(30);
        else {
            now.setHours(now.getHours() + 1);
            now.setMinutes(0);
        }
      } else if (initialData?.dataHora) {
        const initialDate = new Date(initialData.dataHora);
        // Use the date part from initialData, but set time to 09:00
        return new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 9, 0, 0).toISOString().substring(0,16);
      } else {
         // Default to tomorrow 09:00 if no date is provided
        now.setDate(now.getDate() + 1);
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0).toISOString().substring(0,16);
      }
      now.setSeconds(0);
      now.setMilliseconds(0);
      return now.toISOString().substring(0, 16);
  }, [initialData?.dataHora]);


  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues } = useFormValidation<AgendamentoCreateDto | Agendamento>({
    initialValues: initialData 
      ? { 
          ...initialData, 
          clienteId: (initialData as Agendamento).clienteId || '',
          profissionalId: (initialData as Agendamento).profissionalId || '',
          servicoId: (initialData as Agendamento).servicoId || '',
          dataHora: initialData.dataHora ? new Date(new Date(initialData.dataHora).getTime() - (new Date().getTimezoneOffset() * -60000)).toISOString().substring(0, 16) : defaultDataHora(),
          duracaoMinutos: initialData.duracaoMinutos || 0, 
          status: (initialData as Agendamento).status || 'PENDENTE',
          observacoes: initialData.observacoes || '',
        } as Agendamento 
      : {
          clienteId: '',
          profissionalId: '',
          servicoId: '',
          dataHora: defaultDataHora(),
          duracaoMinutos: 0, 
          status: 'PENDENTE',
          observacoes: '',
        },
    validationSchema: agendaValidationSchema as any, 
    onSubmit: async (data) => {
      const dataToSubmit = {
        ...data,
        dataHora: new Date(data.dataHora).toISOString(), 
      };
      await onSubmit(dataToSubmit);
    },
  });

  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>(profissionais);

  // handleChange from useFormValidation is now stable
  const memoizedHandleChange = handleChange; 

  useEffect(() => {
    if (values.servicoId) {
      const selectedServico = servicos.find(s => s.id === values.servicoId);
      if (selectedServico) {
        if (values.duracaoMinutos !== selectedServico.duracaoMinutos) {
          memoizedHandleChange('duracaoMinutos', selectedServico.duracaoMinutos);
        }
        const newFilteredProfissionais = profissionais.filter(p => p.servicosIds.includes(values.servicoId) && p.ativo);
        setFilteredProfissionais(newFilteredProfissionais);
        if (values.profissionalId && !newFilteredProfissionais.some(p => p.id === values.profissionalId)) {
          memoizedHandleChange('profissionalId', '');
        }
      } else {
        if (values.duracaoMinutos !== 0) {
          memoizedHandleChange('duracaoMinutos', 0);
        }
        setFilteredProfissionais(profissionais.filter(p => p.ativo));
        // No need to clear profissionalId if service becomes invalid, user might re-select service.
        // If we want to clear it:
        // if (values.profissionalId !== '') {
        //   memoizedHandleChange('profissionalId', '');
        // }
      }
    } else { 
      if (values.duracaoMinutos !== 0) {
        memoizedHandleChange('duracaoMinutos', 0);
      }
      setFilteredProfissionais(profissionais.filter(p => p.ativo));
      // No need to clear profissionalId if no service selected
      // if (values.profissionalId !== '') {
      //   memoizedHandleChange('profissionalId', '');
      // }
    }
  }, [
      values.servicoId, // Main trigger
      servicos, 
      profissionais, 
      memoizedHandleChange, // Stable function from useFormValidation
      values.duracaoMinutos, // To react to external changes or ensure internal logic consistency
      values.profissionalId // To react to external changes or ensure internal logic consistency
    ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id || initialData?.dataHora ? 'Editar Agendamento' : 'Novo Agendamento'}</CardTitle>
        <CardDescription>Preencha os detalhes do agendamento.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clienteId">Cliente</Label>
            <Select name="clienteId" value={values.clienteId} onValueChange={(value) => handleChange('clienteId', value)}>
              <SelectTrigger id="clienteId"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome} ({c.telefone})</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.clienteId && <p className="text-sm text-destructive mt-1">{errors.clienteId}</p>}
          </div>

          <div>
            <Label htmlFor="servicoId">Serviço</Label>
            <Select name="servicoId" value={values.servicoId} onValueChange={(value) => handleChange('servicoId', value)}>
              <SelectTrigger id="servicoId"><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
              <SelectContent>
                {servicos.filter(s => s.ativo).map(s => <SelectItem key={s.id} value={s.id}>{s.nome} ({s.duracaoMinutos} min)</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.servicoId && <p className="text-sm text-destructive mt-1">{errors.servicoId}</p>}
          </div>
          
          <div>
            <Label htmlFor="profissionalId">Profissional</Label>
            <Select 
              name="profissionalId" 
              value={values.profissionalId} 
              onValueChange={(value) => handleChange('profissionalId', value)} 
              disabled={!values.servicoId || filteredProfissionais.length === 0}
            >
              <SelectTrigger id="profissionalId">
                <SelectValue placeholder={!values.servicoId ? "Selecione um serviço primeiro" : (filteredProfissionais.length === 0 ? "Nenhum prof. p/ este serviço" : "Selecione o profissional")} />
              </SelectTrigger>
              <SelectContent>
                {filteredProfissionais.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.profissionalId && <p className="text-sm text-destructive mt-1">{errors.profissionalId}</p>}
          </div>

          <div>
            <Label htmlFor="dataHora">Data e Hora</Label>
            <Input 
              id="dataHora" 
              name="dataHora" 
              type="datetime-local" 
              value={values.dataHora} 
              onChange={handleInputChange} 
            />
            {errors.dataHora && <p className="text-sm text-destructive mt-1">{errors.dataHora}</p>}
          </div>

           <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" value={values.status as string} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea 
              id="observacoes" 
              name="observacoes" 
              value={values.observacoes || ''} 
              onChange={handleInputChange} 
              placeholder="Notas adicionais sobre o agendamento..."
            />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (initialData?.id || initialData?.dataHora ? 'Salvar Alterações' : 'Criar Agendamento')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

