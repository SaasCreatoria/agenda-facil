'use client';

import type { ProfissionalCreateDto, HorarioDisponivel } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import DisponibilidadePicker from '@/components/profissionais/disponibilidade-picker';

type ValidationSchema = {
  nome: (value: string) => string | null;
};

const profissionalValidationSchema: ValidationSchema = {
  nome: (value) => (value && value.trim() ? null : 'Nome do profissional é obrigatório.'),
};

interface ProfissionalOnboardingFormProps {
  servicoId: string; // ID of the service created in the previous step
  onSubmit: (data: ProfissionalCreateDto) => Promise<boolean>;
  onBack: () => void;
  onProcessing?: (isProcessing: boolean) => void;
}

export default function ProfissionalOnboardingForm({ servicoId, onSubmit, onBack, onProcessing }: ProfissionalOnboardingFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting } = useFormValidation<ProfissionalCreateDto>({
    initialValues: {
      nome: '',
      email: '',
      telefone: '',
      servicosIds: [servicoId], // Pre-assign the service
      horariosDisponiveis: [ // Default availability for Monday to Friday, 9am to 6pm
        { diaSemana: 1, inicio: '09:00', fim: '18:00' },
        { diaSemana: 2, inicio: '09:00', fim: '18:00' },
        { diaSemana: 3, inicio: '09:00', fim: '18:00' },
        { diaSemana: 4, inicio: '09:00', fim: '18:00' },
        { diaSemana: 5, inicio: '09:00', fim: '18:00' },
      ],
      ativo: true,
    },
    validationSchema: profissionalValidationSchema as any,
    onSubmit: async (data) => {
      onProcessing?.(true);
      // Ensure servicosIds contains the passed servicoId, even if form allows changes (it shouldn't for this simplified version)
      const dataToSubmit = { ...data, servicosIds: [servicoId] };
      await onSubmit(dataToSubmit); // Parent handles next step
      onProcessing?.(false);
    },
  });
  
  const handleDisponibilidadeChange = (novosHorarios: HorarioDisponivel[]) => {
    handleChange('horariosDisponiveis', novosHorarios);
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="nome">Nome do Primeiro Profissional (Pode ser você)</Label>
            <Input id="nome" name="nome" value={values.nome} onChange={handleInputChange} placeholder="Ex: João Silva" />
            {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Este profissional será automaticamente vinculado ao serviço que você cadastrou no passo anterior.
          </p>

          <DisponibilidadePicker 
            initialHorarios={values.horariosDisponiveis}
            onChange={handleDisponibilidadeChange}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
           <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Concluir Onboarding'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
