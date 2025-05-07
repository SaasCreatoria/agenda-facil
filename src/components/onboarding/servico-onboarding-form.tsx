'use client';

import type { ServicoCreateDto } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type ValidationSchema = {
  nome: (value: string) => string | null;
  preco: (value: number) => string | null;
  duracaoMinutos: (value: number) => string | null;
};

const servicoValidationSchema: ValidationSchema = {
  nome: (value) => (value && value.trim() ? null : 'Nome do serviço é obrigatório.'),
  preco: (value) => (value !== undefined && value >= 0 ? null : 'Preço deve ser um valor não negativo.'),
  duracaoMinutos: (value) => (value > 0 ? null : 'Duração deve ser maior que zero.'),
};

interface ServicoOnboardingFormProps {
  onSubmit: (data: ServicoCreateDto) => Promise<string | null>; // Returns service ID or null
  onBack: () => void;
  onProcessing?: (isProcessing: boolean) => void;
}

export default function ServicoOnboardingForm({ onSubmit, onBack, onProcessing }: ServicoOnboardingFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting } = useFormValidation<ServicoCreateDto>({
    initialValues: {
      nome: '',
      descricao: '',
      preco: 0,
      duracaoMinutos: 30,
      ativo: true,
    },
    validationSchema: servicoValidationSchema as any,
    onSubmit: async (data) => {
      onProcessing?.(true);
      await onSubmit(data); // Parent handles next step on success (via returned ID)
      onProcessing?.(false);
    },
  });

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="nome">Nome do Primeiro Serviço</Label>
            <Input id="nome" name="nome" value={values.nome} onChange={handleInputChange} placeholder="Ex: Corte de Cabelo Masculino" />
            {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea id="descricao" name="descricao" value={values.descricao || ''} onChange={handleInputChange} placeholder="Detalhes sobre o serviço..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input id="preco" name="preco" type="number" value={values.preco} onChange={handleInputChange} step="0.01" min="0" />
              {errors.preco && <p className="text-sm text-destructive mt-1">{errors.preco}</p>}
            </div>
            <div>
              <Label htmlFor="duracaoMinutos">Duração (minutos)</Label>
              <Input id="duracaoMinutos" name="duracaoMinutos" type="number" value={values.duracaoMinutos} onChange={handleInputChange} min="1" />
              {errors.duracaoMinutos && <p className="text-sm text-destructive mt-1">{errors.duracaoMinutos}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Próximo Passo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
