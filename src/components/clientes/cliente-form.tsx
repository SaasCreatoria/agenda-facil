'use client';

import type { Cliente, ClienteCreateDto } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { isValidEmail, isValidPhoneNumber, maskPhoneNumber } from '@/utils/helpers';
import { useEffect } from 'react';


type ValidationSchema = {
  nome: (value: string) => string | null;
  telefone: (value: string) => string | null;
  email?: (value: string) => string | null;
  dataNascimento?: (value: string) => string | null;
};

const clienteValidationSchema: ValidationSchema = {
  nome: (value) => (value && value.trim() ? null : 'Nome do cliente é obrigatório.'),
  telefone: (value) => (value && isValidPhoneNumber(value.replace(/\D/g, '')) ? null : 'Telefone é obrigatório e deve ser válido. Ex: (XX) XXXXX-XXXX'),
  email: (value) => (!value || isValidEmail(value) ? null : 'Email inválido.'),
  dataNascimento: (value) => {
    if (!value) return null; // Optional field
    if (new Date(value) > new Date()) return "Data de nascimento não pode ser no futuro."
    return null;
  },
};

interface ClienteFormProps {
  initialData?: Cliente;
  onSubmit: (data: ClienteCreateDto | Cliente) => Promise<void>;
  onCancel?: () => void;
  existingClientes: Cliente[]; // For checking unique phone if desired
}

export default function ClienteForm({ initialData, onSubmit, onCancel, existingClientes }: ClienteFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues } = useFormValidation<ClienteCreateDto | Cliente>({
    initialValues: initialData || {
      nome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      observacoes: '',
    },
    validationSchema: {
        ...clienteValidationSchema,
        telefone: (value: string) => { // Custom validation for unique phone (optional)
            const cleanedPhone = value.replace(/\D/g, '');
            if (!cleanedPhone) return 'Telefone é obrigatório.';
            if (!isValidPhoneNumber(cleanedPhone)) return 'Telefone inválido. Use (XX) XXXXX-XXXX';
            // const isPhoneTaken = existingClientes.some(
            //   c => c.telefone.replace(/\D/g, '') === cleanedPhone && c.id !== initialData?.id
            // );
            // if (isPhoneTaken) return 'Este telefone já está em uso.';
            return null;
        }
    } as any,
    onSubmit: async (data) => {
      await onSubmit({ ...data, telefone: data.telefone.replace(/\D/g, '') }); // Submit cleaned phone
    },
  });

  // Mask phone number on input
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskPhoneNumber(event.target.value);
    handleChange('telefone', maskedValue);
  };
  
  // Format date for input type="date"
  useEffect(() => {
    if (initialData?.dataNascimento) {
      try {
        const date = new Date(initialData.dataNascimento);
        if (!isNaN(date.getTime())) {
             handleChange('dataNascimento', date.toISOString().split('T')[0]);
        }
      } catch (e) {
        console.warn("Invalid initial date for dataNascimento", initialData.dataNascimento)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.dataNascimento]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
        <CardDescription>Preencha os dados do cliente.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" name="nome" value={values.nome} onChange={handleInputChange} />
            {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
              <Input id="telefone" name="telefone" type="tel" value={values.telefone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" />
              {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email (Opcional)</Label>
              <Input id="email" name="email" type="email" value={values.email || ''} onChange={handleInputChange} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="dataNascimento">Data de Nascimento (Opcional)</Label>
            <Input id="dataNascimento" name="dataNascimento" type="date" value={values.dataNascimento || ''} onChange={handleInputChange} />
            {errors.dataNascimento && <p className="text-sm text-destructive mt-1">{errors.dataNascimento}</p>}
          </div>

          <div>
            <Label htmlFor="observacoes">Observações (Opcional)</Label>
            <Textarea id="observacoes" name="observacoes" value={values.observacoes || ''} onChange={handleInputChange} placeholder="Preferências, alergias, etc."/>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Cliente')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}