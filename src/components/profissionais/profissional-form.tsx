'use client';

import type { Profissional, ProfissionalCreateDto, Servico, HorarioDisponivel } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import DisponibilidadePicker from './disponibilidade-picker';
import { isValidEmail, isValidPhoneNumber } from '@/utils/helpers';
import { ScrollArea } from '@/components/ui/scroll-area';

type ValidationSchema = {
  nome: (value: string) => string | null;
  email?: (value: string) => string | null;
  telefone?: (value: string) => string | null;
  servicosIds: (value: string[]) => string | null;
};

const profissionalValidationSchema: ValidationSchema = {
  nome: (value) => (value && value.trim() ? null : 'Nome do profissional é obrigatório.'),
  email: (value) => (!value || isValidEmail(value) ? null : 'Email inválido.'),
  telefone: (value) => (!value || isValidPhoneNumber(value) ? null : 'Telefone inválido. Use (XX) XXXXX-XXXX.'),
  servicosIds: (value) => (value && value.length > 0 ? null : 'Selecione ao menos um serviço.'),
};


interface ProfissionalFormProps {
  initialData?: Profissional;
  onSubmit: (data: ProfissionalCreateDto | Profissional) => Promise<void>;
  onCancel?: () => void;
  allServicos: Servico[];
  existingProfissionais: Profissional[]; // To check for unique email
}

export default function ProfissionalForm({ initialData, onSubmit, onCancel, allServicos, existingProfissionais }: ProfissionalFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues, validateField } = useFormValidation<ProfissionalCreateDto | Profissional>({
    initialValues: initialData || {
      nome: '',
      email: '',
      telefone: '',
      servicosIds: [],
      horariosDisponiveis: [],
      ativo: true,
    },
    validationSchema: {
      ...profissionalValidationSchema,
      email: (value: string) => { // Custom validation for unique email
        if (!value) return null; // Optional
        if (value && !isValidEmail(value)) return 'Email inválido.';
        const isEmailTaken = existingProfissionais.some(
          p => p.email?.toLowerCase() === value.toLowerCase() && p.id !== initialData?.id
        );
        return isEmailTaken ? 'Este email já está em uso.' : null;
      },
    } as any,
    onSubmit: async (data) => {
      await onSubmit(data);
    },
  });

  const handleServicoChange = (servicoId: string, checked: boolean) => {
    const currentServicos = values.servicosIds || [];
    let newServicosIds;
    if (checked) {
      newServicosIds = [...currentServicos, servicoId];
    } else {
      newServicosIds = currentServicos.filter(id => id !== servicoId);
    }
    handleChange('servicosIds', newServicosIds);
    validateField('servicosIds', newServicosIds); // Manually trigger validation for array field
  };
  
  const handleDisponibilidadeChange = (novosHorarios: HorarioDisponivel[]) => {
    handleChange('horariosDisponiveis', novosHorarios);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Profissional' : 'Novo Profissional'}</CardTitle>
        <CardDescription>Preencha os detalhes do profissional.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <ScrollArea className="h-[60vh] md:h-auto max-h-[calc(100vh-20rem)]"> {/* Scroll for smaller screens or many fields */}
          <CardContent className="space-y-4 p-4 md:p-6">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" name="nome" value={values.nome} onChange={handleInputChange} />
              {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Opcional)</Label>
                <Input id="email" name="email" type="email" value={values.email || ''} onChange={handleInputChange} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone (Opcional)</Label>
                <Input id="telefone" name="telefone" type="tel" value={values.telefone || ''} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX"/>
                {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone}</p>}
              </div>
            </div>
            
            <div>
              <Label>Serviços Oferecidos</Label>
              <div className="space-y-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                {allServicos.filter(s => s.ativo).map(servico => (
                  <div key={servico.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`servico-${servico.id}`}
                      checked={values.servicosIds.includes(servico.id)}
                      onCheckedChange={(checked) => handleServicoChange(servico.id, !!checked)}
                    />
                    <Label htmlFor={`servico-${servico.id}`} className="font-normal">{servico.nome}</Label>
                  </div>
                ))}
                 {allServicos.filter(s => s.ativo).length === 0 && <p className="text-xs text-muted-foreground">Nenhum serviço ativo cadastrado.</p>}
              </div>
              {errors.servicosIds && <p className="text-sm text-destructive mt-1">{errors.servicosIds}</p>}
            </div>

            <DisponibilidadePicker 
              initialHorarios={values.horariosDisponiveis}
              onChange={handleDisponibilidadeChange}
            />
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                  id="ativo" 
                  name="ativo" 
                  checked={(values as Profissional).ativo} 
                  onCheckedChange={(checked) => handleChange('ativo', checked)}
              />
              <Label htmlFor="ativo">Profissional Ativo</Label>
            </div>

          </CardContent>
        </ScrollArea>
        <CardFooter className="flex justify-end space-x-2 border-t pt-4 mt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Profissional')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}