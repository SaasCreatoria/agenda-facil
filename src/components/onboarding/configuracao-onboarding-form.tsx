'use client';

import type { ConfiguracaoEmpresa } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type ValidationSchema = {
  nomeEmpresa: (value: string) => string | null;
  fusoHorario: (value: string) => string | null;
};

const configValidationSchema: ValidationSchema = {
  nomeEmpresa: (value) => (value && value.trim() ? null : 'Nome da empresa é obrigatório.'),
  fusoHorario: (value) => (value ? null : 'Fuso horário é obrigatório.'),
};

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Brasil - São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'EUA - Nova York (GMT-4/-5)' },
  { value: 'Europe/London', label: 'Reino Unido - Londres (GMT+0/+1)' },
  { value: 'Europe/Paris', label: 'Europa - Paris (GMT+1/+2)' },
  { value: 'Asia/Tokyo', label: 'Japão - Tóquio (GMT+9)' },
];

interface ConfiguracaoOnboardingFormProps {
  initialData: Partial<ConfiguracaoEmpresa>;
  onSubmit: (data: Partial<ConfiguracaoEmpresa>) => Promise<boolean>;
  onProcessing?: (isProcessing: boolean) => void;
}

export default function ConfiguracaoOnboardingForm({ initialData, onSubmit, onProcessing }: ConfiguracaoOnboardingFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting } = useFormValidation<Partial<ConfiguracaoEmpresa>>({
    initialValues: {
        nomeEmpresa: initialData.nomeEmpresa || '',
        fusoHorario: initialData.fusoHorario || 'America/Sao_Paulo',
    },
    validationSchema: configValidationSchema as any,
    onSubmit: async (data) => {
      onProcessing?.(true);
      const success = await onSubmit(data);
      onProcessing?.(false);
      // Parent component handles next step on success
    },
  });

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="nomeEmpresa">Nome da Sua Empresa ou Negócio</Label>
            <Input id="nomeEmpresa" name="nomeEmpresa" value={values.nomeEmpresa || ''} onChange={handleInputChange} placeholder="Ex: Salão da Maria" />
            {errors.nomeEmpresa && <p className="text-sm text-destructive mt-1">{errors.nomeEmpresa}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fusoHorario">Seu Fuso Horário Principal</Label>
            <Select name="fusoHorario" value={values.fusoHorario} onValueChange={(value) => handleChange('fusoHorario', value)}>
              <SelectTrigger id="fusoHorario"><SelectValue placeholder="Selecione o fuso horário" /></SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.fusoHorario && <p className="text-sm text-destructive mt-1">{errors.fusoHorario}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Próximo Passo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
