'use client';

import type { ConfiguracaoEmpresa, LembreteTipo } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type ValidationSchema = {
  nomeEmpresa: (value: string) => string | null;
  fusoHorario: (value: string) => string | null;
  antecedenciaLembreteHoras: (value: number) => string | null;
  canalLembretePadrao: (value: string) => string | null;
};

const configValidationSchema: ValidationSchema = {
  nomeEmpresa: (value) => (value && value.trim() ? null : 'Nome da empresa é obrigatório.'),
  fusoHorario: (value) => (value ? null : 'Fuso horário é obrigatório.'),
  antecedenciaLembreteHoras: (value) => (value > 0 ? null : 'Antecedência deve ser maior que zero horas.'),
  canalLembretePadrao: (value) => (value ? null : 'Canal de lembrete padrão é obrigatório.'),
};

// A more comprehensive list might be needed or fetched.
// For simplicity, a small list of common IANA timezones.
const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-4/-5 EST/EDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0/+1 GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1/+2 CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9 JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10/+11 AEST/AEDT)' },
];

const LEMBRETE_CANAIS: { value: LembreteTipo, label: string}[] = [
    { value: 'EMAIL', label: 'Email'},
    { value: 'SMS', label: 'SMS (Indisponível)'}, // Mark as unavailable if not implemented
    { value: 'WHATSAPP', label: 'WhatsApp (Indisponível)'}
];

interface ConfigFormProps {
  initialData: ConfiguracaoEmpresa;
  onSubmit: (data: ConfiguracaoEmpresa) => Promise<void>;
}

export default function ConfigForm({ initialData, onSubmit }: ConfigFormProps) {
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues } = useFormValidation<ConfiguracaoEmpresa>({
    initialValues: initialData,
    validationSchema: configValidationSchema as any,
    onSubmit: async (data) => {
      await onSubmit(data);
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoBase64 || null);

  useEffect(() => {
    setValues(initialData); // Ensure form updates if initialData changes from parent
    setLogoPreview(initialData.logoBase64 || null);
  }, [initialData, setValues]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB for logo
        alert("O arquivo da logo deve ser menor que 2MB.");
        event.target.value = ""; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange('logoBase64', base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
          <Input id="nomeEmpresa" name="nomeEmpresa" value={values.nomeEmpresa} onChange={handleInputChange} />
          {errors.nomeEmpresa && <p className="text-sm text-destructive mt-1">{errors.nomeEmpresa}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fusoHorario">Fuso Horário</Label>
          <Select name="fusoHorario" value={values.fusoHorario} onValueChange={(value) => handleChange('fusoHorario', value)}>
            <SelectTrigger id="fusoHorario"><SelectValue placeholder="Selecione o fuso horário" /></SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.fusoHorario && <p className="text-sm text-destructive mt-1">{errors.fusoHorario}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoEmpresa">Logo da Empresa (Opcional, max 2MB)</Label>
        <Input id="logoEmpresa" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleLogoChange} />
        {logoPreview && (
          <div className="mt-2 h-24 w-auto max-w-xs p-2 border rounded-md flex items-center justify-center bg-muted">
             <Image src={logoPreview} alt="Preview do Logo" width={100} height={100} className="object-contain max-h-full max-w-full rounded" />
          </div>
        )}
        {!logoPreview && (
            <div className="mt-2 h-24 w-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground" data-ai-hint="logo placeholder">
              Preview
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="antecedenciaLembreteHoras">Antecedência do Lembrete (horas)</Label>
          <Input id="antecedenciaLembreteHoras" name="antecedenciaLembreteHoras" type="number" value={values.antecedenciaLembreteHoras} onChange={handleInputChange} min="1" />
          {errors.antecedenciaLembreteHoras && <p className="text-sm text-destructive mt-1">{errors.antecedenciaLembreteHoras}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="canalLembretePadrao">Canal Padrão de Lembrete</Label>
          <Select name="canalLembretePadrao" value={values.canalLembretePadrao} onValueChange={(value) => handleChange('canalLembretePadrao', value as LembreteTipo)}>
            <SelectTrigger id="canalLembretePadrao"><SelectValue placeholder="Selecione o canal" /></SelectTrigger>
            <SelectContent>
              {LEMBRETE_CANAIS.map(canal => 
                <SelectItem key={canal.value} value={canal.value} disabled={canal.label.includes('Indisponível')}>
                    {canal.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
           {errors.canalLembretePadrao && <p className="text-sm text-destructive mt-1">{errors.canalLembretePadrao}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}