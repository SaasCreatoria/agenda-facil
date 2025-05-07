
'use client';

import type { Servico, ServicoCreateDto } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

type ValidationSchema = {
  nome: (value: string) => string | null;
  preco: (value: number) => string | null;
  duracaoMinutos: (value: number) => string | null;
};

const servicoValidationSchema: ValidationSchema = {
  nome: (value) => (value && value.trim() ? null : 'Nome do serviço é obrigatório.'),
  preco: (value) => (value !== undefined && value >= 0 ? null : 'Preço deve ser um valor não negativo.'), // Allow 0
  duracaoMinutos: (value) => (value !== undefined && value > 0 ? null : 'Duração deve ser maior que zero.'),
};

interface ServicoFormProps {
  initialData?: Servico;
  onSubmit: (data: ServicoCreateDto | Servico) => Promise<void>;
  onCancel?: () => void;
}

export default function ServicoForm({ initialData, onSubmit, onCancel }: ServicoFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues } = useFormValidation<ServicoCreateDto | Servico>({
    initialValues: initialData || {
      nome: '',
      descricao: '',
      preco: 0,
      duracaoMinutos: 30,
      ativo: true,
    },
    validationSchema: servicoValidationSchema as any,
    onSubmit: async (data) => {
      const dataToSubmit = {
        ...data,
        preco: data.preco === undefined ? 0 : Number(data.preco),
        duracaoMinutos: data.duracaoMinutos === undefined ? 0 : Number(data.duracaoMinutos),
      };
      await onSubmit(dataToSubmit);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Serviço' : 'Novo Serviço'}</CardTitle>
        <CardDescription>Preencha os detalhes do serviço.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Serviço</Label>
            <Input id="nome" name="nome" value={values.nome} onChange={handleInputChange} />
            {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea id="descricao" name="descricao" value={values.descricao || ''} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input 
                id="preco" 
                name="preco" 
                type="number" 
                value={(values.preco === undefined || isNaN(values.preco as number)) ? '' : values.preco} 
                onChange={handleInputChange} 
                step="0.01" 
              />
              {errors.preco && <p className="text-sm text-destructive mt-1">{errors.preco}</p>}
            </div>
            <div>
              <Label htmlFor="duracaoMinutos">Duração (minutos)</Label>
              <Input 
                id="duracaoMinutos" 
                name="duracaoMinutos" 
                type="number" 
                value={(values.duracaoMinutos === undefined || isNaN(values.duracaoMinutos as number)) ? '' : values.duracaoMinutos} 
                onChange={handleInputChange} 
              />
              {errors.duracaoMinutos && <p className="text-sm text-destructive mt-1">{errors.duracaoMinutos}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
                id="ativo" 
                name="ativo" 
                checked={(values as Servico).ativo} 
                onCheckedChange={(checked) => handleChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Serviço Ativo</Label>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Serviço')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
