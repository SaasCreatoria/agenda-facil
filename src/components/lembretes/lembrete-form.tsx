
'use client';

import type { Lembrete, LembreteTipo, LembreteUpdateDto } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const LEMBRETE_CANAIS: { value: LembreteTipo, label: string, disabled?: boolean }[] = [
    { value: 'EMAIL', label: 'Email'},
    { value: 'SMS', label: 'SMS (Indisponível)', disabled: true }, 
    { value: 'WHATSAPP', label: 'WhatsApp (via Zapier)'}
];

type ValidationSchema = {
  tipo: (value: LembreteTipo) => string | null;
  dataEnvioAgendado: (value: string) => string | null;
  mensagem: (value: string) => string | null;
};

const lembreteValidationSchema: ValidationSchema = {
  tipo: (value) => (value ? null : 'Tipo do lembrete é obrigatório.'),
  dataEnvioAgendado: (value) => {
    if (!value) return 'Data e hora de envio são obrigatórios.';
    if (new Date(value) < new Date(new Date().setHours(0,0,0,0))) return 'A data de envio não pode ser no passado.'; // Check against start of today
    return null;
  },
  mensagem: (value) => (value && value.trim() ? null : 'Mensagem é obrigatória.'),
};

interface LembreteFormProps {
  initialData: Lembrete;
  onSubmit: (data: LembreteUpdateDto) => Promise<void>;
  onCancel?: () => void;
}

export default function LembreteForm({ initialData, onSubmit, onCancel }: LembreteFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting } = 
    useFormValidation<LembreteUpdateDto>({
    initialValues: {
        tipo: initialData.tipo,
        dataEnvioAgendado: new Date(initialData.dataEnvioAgendado).toISOString().substring(0, 16),
        mensagem: initialData.mensagem || '',
        status: initialData.status, // Though status might be reset by logic, include for completeness
    },
    validationSchema: lembreteValidationSchema as any,
    onSubmit: async (data) => {
      const dataToSubmit = {
        ...data,
        // Ensure dataEnvioAgendado is in full ISO format if it's a string from datetime-local
        dataEnvioAgendado: typeof data.dataEnvioAgendado === 'string' 
            ? new Date(data.dataEnvioAgendado).toISOString() 
            : data.dataEnvioAgendado,
      };
      await onSubmit(dataToSubmit);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Lembrete</CardTitle>
        <CardDescription>Ajuste os detalhes do lembrete.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tipo">Canal de Envio</Label>
            <Select name="tipo" value={values.tipo} onValueChange={(value) => handleChange('tipo', value as LembreteTipo)}>
              <SelectTrigger id="tipo"><SelectValue placeholder="Selecione o canal" /></SelectTrigger>
              <SelectContent>
                {LEMBRETE_CANAIS.map(canal => 
                  <SelectItem key={canal.value} value={canal.value} disabled={canal.disabled}>
                      {canal.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-sm text-destructive mt-1">{errors.tipo}</p>}
          </div>

          <div>
            <Label htmlFor="dataEnvioAgendado">Data e Hora de Envio</Label>
            <Input 
              id="dataEnvioAgendado" 
              name="dataEnvioAgendado" 
              type="datetime-local" 
              value={values.dataEnvioAgendado || ''} 
              onChange={handleInputChange} 
            />
            {errors.dataEnvioAgendado && <p className="text-sm text-destructive mt-1">{errors.dataEnvioAgendado}</p>}
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea 
              id="mensagem" 
              name="mensagem" 
              value={values.mensagem || ''} 
              onChange={handleInputChange} 
              placeholder="Conteúdo da mensagem do lembrete..."
              rows={4}
            />
            {errors.mensagem && <p className="text-sm text-destructive mt-1">{errors.mensagem}</p>}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
