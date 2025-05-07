
'use client';

import type { Agendamento, AgendamentoCreateDto, Servico, Profissional, Cliente } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useEffect, useState } from 'react';

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
  initialData?: Agendamento;
  onSubmit: (data: AgendamentoCreateDto | Agendamento) => Promise<void>;
  onCancel?: () => void;
  servicos: Servico[];
  profissionais: Profissional[];
  clientes: Cliente[];
}

export default function AgendaForm({ initialData, onSubmit, onCancel, servicos, profissionais, clientes }: AgendaFormProps) {
  const defaultDataHora = () => {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      if (now.getMinutes() < 30) now.setMinutes(30);
      else {
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
      }
      now.setSeconds(0);
      now.setMilliseconds(0);
      return now.toISOString().substring(0, 16);
  }


  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues } = useFormValidation<AgendamentoCreateDto | Agendamento>({
    initialValues: initialData 
      ? { ...initialData, dataHora: new Date(initialData.dataHora).toISOString().substring(0, 16) } 
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

  useEffect(() => {
    if (values.servicoId) {
      const selectedServico = servicos.find(s => s.id === values.servicoId);
      if (selectedServico) {
        handleChange('duracaoMinutos', selectedServico.duracaoMinutos);
        const newFilteredProfissionais = profissionais.filter(p => p.servicosIds.includes(values.servicoId) && p.ativo);
        setFilteredProfissionais(newFilteredProfissionais);
        if (values.profissionalId && !newFilteredProfissionais.some(p => p.id === values.profissionalId)) {
            handleChange('profissionalId', '');
        }
      }
    } else {
      handleChange('duracaoMinutos', 0);
      setFilteredProfissionais(profissionais.filter(p => p.ativo)); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.servicoId, servicos, profissionais, handleChange]); // Added handleChange to dependencies

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Agendamento' : 'Novo Agendamento'}</CardTitle>
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
            <Select name="profissionalId" value={values.profissionalId} onValueChange={(value) => handleChange('profissionalId', value)} disabled={!values.servicoId || filteredProfissionais.length === 0}>
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
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Agendamento')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

