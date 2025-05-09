
'use client';

import type { ConfiguracaoEmpresa, LembreteTipo } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast'; 
import { Loader2, Copy, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context'; 
import { hslToHex, hexToHsl } from '@/utils/color-utils';

type ValidationSchema = {
  nomeEmpresa: (value: string) => string | null;
  fusoHorario: (value: string) => string | null;
  antecedenciaLembreteHoras: (value: number) => string | null;
  canalLembretePadrao: (value: string) => string | null;
  zapiInstancia?: (value: string) => string | null;
  zapiToken?: (value: string) => string | null;
  publicPageTitle?: (value: string) => string | null;
  publicPageWelcomeMessage?: (value: string) => string | null;
  publicPagePrimaryColor?: (value: string) => string | null;
  publicPageAccentColor?: (value: string) => string | null;
  publicPageSlug?: (value: string) => string | null;
};

const HSL_REGEX = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const configValidationSchema: ValidationSchema = {
  nomeEmpresa: (value) => (value && value.trim() ? null : 'Nome da empresa é obrigatório.'),
  fusoHorario: (value) => (value ? null : 'Fuso horário é obrigatório.'),
  antecedenciaLembreteHoras: (value) => (value !== undefined && value > 0 ? null : 'Antecedência deve ser maior que zero horas.'),
  canalLembretePadrao: (value) => (value ? null : 'Canal de lembrete padrão é obrigatório.'),
  zapiInstancia: (value) => (!value || value.trim().length > 0 ? null : 'ID da Instância Z-API não pode ser apenas espaços em branco.'),
  zapiToken: (value) => (!value || value.trim().length > 0 ? null : 'Token da Instância Z-API não pode ser apenas espaços em branco.'),
  publicPageTitle: (value) => (!value || (value.trim().length >= 3 && value.trim().length <= 60) ? null : 'Título deve ter entre 3 e 60 caracteres.'),
  publicPageWelcomeMessage: (value) => (!value || (value.trim().length >= 10 && value.trim().length <= 200) ? null : 'Mensagem deve ter entre 10 e 200 caracteres.'),
  publicPagePrimaryColor: (value) => (!value || HSL_REGEX.test(value) ? null : 'Cor primária deve ser um HSL válido (e.g., "180 100% 25%") ou vazia.'),
  publicPageAccentColor: (value) => (!value || HSL_REGEX.test(value) ? null : 'Cor de destaque deve ser um HSL válido (e.g., "240 100% 27%") ou vazia.'),
  publicPageSlug: (value) => {
    if (!value || value.trim() === '') return null; // Slug is optional, allow empty to use UID
    const trimmedValue = value.trim();
    if (!SLUG_REGEX.test(trimmedValue)) return 'Use letras minúsculas, números e hífens (não no início/fim, sem ser repetido).';
    if (trimmedValue.length < 3 || trimmedValue.length > 30) return 'Link deve ter entre 3 e 30 caracteres.';
    return null;
  },
};

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-4/-5 EST/EDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0/+1 GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1/+2 CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9 JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10/+11 AEST/AEDT)' },
];

const LEMBRETE_CANAIS: { value: LembreteTipo, label: string, disabled?: boolean}[] = [
    { value: 'EMAIL', label: 'Email'},
    { value: 'SMS', label: 'SMS (Indisponível)', disabled: true}, 
    { value: 'WHATSAPP', label: 'WhatsApp (via Z-API)'}
];

interface ConfigFormProps {
  initialData: ConfiguracaoEmpresa;
  onSubmit: (data: ConfiguracaoEmpresa) => Promise<void>;
}

export default function ConfigForm({ initialData, onSubmit }: ConfigFormProps) {
  const { user } = useAuth();
  const { values, errors, handleChange, handleInputChange, handleSubmit, isSubmitting, setValues } = useFormValidation<ConfiguracaoEmpresa>({
    initialValues: initialData,
    validationSchema: configValidationSchema as any,
    onSubmit: async (data) => {
      const dataToSubmit = {
        ...data,
        antecedenciaLembreteHoras: data.antecedenciaLembreteHoras === undefined ? 0 : Number(data.antecedenciaLembreteHoras),
        zapiInstancia: data.zapiInstancia?.trim(),
        zapiToken: data.zapiToken?.trim(),
        publicPageSlug: data.publicPageSlug?.trim().toLowerCase() || '', // Send empty if user clears it
      };
      await onSubmit(dataToSubmit as ConfiguracaoEmpresa);
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoBase64 || null);
  const [heroBannerPreview, setHeroBannerPreview] = useState<string | null>(initialData.heroBannerBase64 || null);
  const [isTestingZapi, setIsTestingZapi] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setValues(initialData); 
    setLogoPreview(initialData.logoBase64 || null);
    setHeroBannerPreview(initialData.heroBannerBase64 || null);
  }, [initialData, setValues]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoBase64' | 'heroBannerBase64', setPreview: (value: string | null) => void, imageType: 'Logo' | 'Banner') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({ variant: "destructive", title: "Arquivo Muito Grande", description: `O arquivo do ${imageType.toLowerCase()} deve ser menor que 2MB.` });
        event.target.value = ""; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange(fieldName, base64String);
        setPreview(base64String);
        toast({title: `${imageType} Atualizado`, description: `A pré-visualização do ${imageType.toLowerCase()} foi atualizada. Salve as configurações para aplicar.`})
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestZapiConnection = async () => {
    const instanceId = values.zapiInstancia?.trim();
    const token = values.zapiToken?.trim();

    if (!instanceId || !token) {
      toast({
        variant: 'destructive',
        title: 'Credenciais Z-API ausentes',
        description: 'Por favor, preencha o ID da Instância e o Token Z-API.',
      });
      return;
    }

    setIsTestingZapi(true);
    try {
      const clientToken = "F3fb1943a17df4662b2234245608a141cS"; 
      const response = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/status`, {
        method: 'GET',
        headers: {
          'Client-Token': clientToken
        }
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Conexão com Z-API bem-sucedida!',
          description: `Status da instância: ${data.connected ? 'Conectada' : 'Desconectada'} (${data.statusReason || 'OK'})`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha ao conectar com Z-API',
          description: `Erro ${response.status}: ${data.error || data.value || response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error testing Z-API connection:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao testar Z-API',
        description: 'Não foi possível conectar ao servidor Z-API. Verifique sua conexão ou as credenciais.',
      });
    } finally {
      setIsTestingZapi(false);
    }
  };

  const publicPageUrl = useMemo(() => {
    if (typeof window !== 'undefined' && user?.uid) {
      const slugToUse = values.publicPageSlug?.trim() ? values.publicPageSlug.trim().toLowerCase() : user.uid;
      return `${window.location.origin}/publica/${slugToUse}`;
    }
    return '';
  }, [user?.uid, values.publicPageSlug]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Link Copiado!", description: "O link da sua página pública foi copiado." });
    }).catch(err => {
      toast({ variant: "destructive", title: "Erro ao copiar", description: "Não foi possível copiar o link." });
      console.error('Failed to copy: ', err);
    });
  };

  const ColorPickerInput = ({
    label,
    name,
    value, 
    error,
    defaultHexForPicker = '#008080' 
  }: {
    label: string;
    name: keyof ConfiguracaoEmpresa;
    value: string | undefined;
    error?: string | null;
    defaultHexForPicker?: string;
  }) => (
    <div className="space-y-1">
      <Label htmlFor={`color-picker-${name}`}>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          id={`color-picker-${name}`}
          value={hslToHex(value || '') || defaultHexForPicker}
          onChange={(e) => {
            const newHex = e.target.value;
            const newHsl = hexToHsl(newHex);
            if (newHsl) {
              handleChange(name, newHsl);
            } else {
              handleChange(name, ''); 
            }
          }}
          className="p-0 w-10 h-10 border-none rounded-md cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-ring bg-transparent"
          style={{ 
            backgroundColor: hslToHex(value || '') || 'transparent',
            border: '1px solid hsl(var(--border))' 
          }}
        />
        <span className="text-sm text-muted-foreground flex-1">
          {value ? `HSL: ${value}` : 'Padrão do tema'}
        </span>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleChange(name, '')}
            className="text-xs"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Resetar
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Clique no quadrado colorido para escolher. Deixe vazio para usar a cor padrão do tema.
      </p>
    </div>
  );


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
      
      <Separator className="my-6" />
      <h3 className="text-lg font-medium mb-4 -mt-2">Configurações de Lembretes e WhatsApp (Z-API)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="antecedenciaLembreteHoras">Antecedência do Lembrete (horas)</Label>
          <Input 
            id="antecedenciaLembreteHoras" 
            name="antecedenciaLembreteHoras" 
            type="number" 
            value={(values.antecedenciaLembreteHoras === undefined || isNaN(values.antecedenciaLembreteHoras as number)) ? '' : values.antecedenciaLembreteHoras} 
            onChange={handleInputChange} 
            min="1" 
          />
          {errors.antecedenciaLembreteHoras && <p className="text-sm text-destructive mt-1">{errors.antecedenciaLembreteHoras}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="canalLembretePadrao">Canal Padrão de Lembrete</Label>
          <Select name="canalLembretePadrao" value={values.canalLembretePadrao} onValueChange={(value) => handleChange('canalLembretePadrao', value as LembreteTipo)}>
            <SelectTrigger id="canalLembretePadrao"><SelectValue placeholder="Selecione o canal" /></SelectTrigger>
            <SelectContent>
              {LEMBRETE_CANAIS.map(canal => 
                <SelectItem key={canal.value} value={canal.value} disabled={canal.disabled}>
                    {canal.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
           {errors.canalLembretePadrao && <p className="text-sm text-destructive mt-1">{errors.canalLembretePadrao}</p>}
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
            <Label htmlFor="zapiInstancia">Z-API ID da Instância (Opcional)</Label>
            <Input 
            id="zapiInstancia" 
            name="zapiInstancia" 
            value={values.zapiInstancia || ''} 
            onChange={handleInputChange}
            placeholder="Seu ID da Instância Z-API"
            />
            {errors.zapiInstancia && <p className="text-sm text-destructive mt-1">{errors.zapiInstancia}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="zapiToken">Z-API Token da Instância (Opcional)</Label>
            <Input 
            id="zapiToken" 
            name="zapiToken" 
            value={values.zapiToken || ''} 
            onChange={handleInputChange}
            placeholder="Seu Token da Instância Z-API"
            />
            {errors.zapiToken && <p className="text-sm text-destructive mt-1">{errors.zapiToken}</p>}
        </div>
      </div>
      <div className="mt-2 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestZapiConnection} 
                disabled={isTestingZapi || !values.zapiInstancia?.trim() || !values.zapiToken?.trim()}
                className="w-full md:w-auto"
            >
                {isTestingZapi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Testar Conexão Z-API
            </Button>
             <p className="text-xs text-muted-foreground flex-1">
                Se preenchidos, os lembretes via WhatsApp serão enviados através da sua conta Z-API.
            </p>
       </div>

      <Separator className="my-6" />
      <h3 className="text-lg font-medium mb-4 -mt-2">Personalização da Página Pública</h3>
      
       <div className="space-y-2 mb-4">
          <Label htmlFor="publicPageSlug">Link Personalizado (Opcional)</Label>
           <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {typeof window !== 'undefined' ? `${window.location.origin}/publica/` : '/publica/'}
                </span>
                <Input 
                    id="publicPageSlug" 
                    name="publicPageSlug" 
                    value={values.publicPageSlug || ''} 
                    onChange={handleInputChange}
                    placeholder={user?.uid.substring(0,10) + '...' || "seu-link-aqui"}
                    className="flex-1"
                />
            </div>
            {errors.publicPageSlug && <p className="text-sm text-destructive mt-1">{errors.publicPageSlug}</p>}
             <p className="text-xs text-muted-foreground">
                Se deixado em branco, seu ID de usuário será usado. Ex: {user?.uid}
            </p>
       </div>

        <div className="space-y-2 mb-4">
          <Label>Link Completo da Sua Página Pública</Label>
          {publicPageUrl ? (
            <div className="flex items-center space-x-2">
              <Input type="text" value={publicPageUrl} readOnly className="bg-muted"/>
              <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(publicPageUrl)} aria-label="Copiar link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Carregando link...</p>
          )}
        </div>


      <div className="space-y-2">
        <Label htmlFor="logoEmpresa">Logo da Empresa (Opcional, max 2MB)</Label>
        <Input id="logoEmpresa" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={(e) => handleImageChange(e, 'logoBase64', setLogoPreview, 'Logo')} />
        {logoPreview ? (
          <div className="mt-2 h-24 w-auto max-w-xs p-2 border rounded-md flex items-center justify-center bg-muted">
             <Image src={logoPreview} alt="Preview do Logo" width={100} height={100} className="object-contain max-h-full max-w-full rounded" data-ai-hint="company logo preview"/>
          </div>
        ) : (
            <div className="mt-2 h-24 w-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground" data-ai-hint="logo placeholder">
              Logo
            </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="heroBanner">Banner Principal da Página Pública (Opcional, max 2MB, recomendado 1200x400px)</Label>
        <Input id="heroBanner" type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageChange(e, 'heroBannerBase64', setHeroBannerPreview, 'Banner')} />
        {heroBannerPreview ? (
          <div className="mt-2 h-32 w-auto max-w-md p-2 border rounded-md flex items-center justify-center bg-muted">
             <Image src={heroBannerPreview} alt="Preview do Banner" width={200} height={100} className="object-contain max-h-full max-w-full rounded" data-ai-hint="hero banner preview"/>
          </div>
        ) : (
            <div className="mt-2 h-32 w-full max-w-md bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground" data-ai-hint="banner placeholder">
              Banner
            </div>
        )}
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="publicPageTitle">Título da Página Pública</Label>
        <Input id="publicPageTitle" name="publicPageTitle" value={values.publicPageTitle || ''} onChange={handleInputChange} />
        {errors.publicPageTitle && <p className="text-sm text-destructive mt-1">{errors.publicPageTitle}</p>}
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="publicPageWelcomeMessage">Mensagem de Boas-vindas</Label>
        <Textarea id="publicPageWelcomeMessage" name="publicPageWelcomeMessage" value={values.publicPageWelcomeMessage || ''} onChange={handleInputChange} placeholder="Uma breve mensagem para seus clientes..."/>
        {errors.publicPageWelcomeMessage && <p className="text-sm text-destructive mt-1">{errors.publicPageWelcomeMessage}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <ColorPickerInput
          label="Cor Primária da Página"
          name="publicPagePrimaryColor"
          value={values.publicPagePrimaryColor}
          error={errors.publicPagePrimaryColor}
          defaultHexForPicker="#008080" // Teal, matches current theme primary
        />
        <ColorPickerInput
          label="Cor de Destaque da Página"
          name="publicPageAccentColor"
          value={values.publicPageAccentColor}
          error={errors.publicPageAccentColor}
          defaultHexForPicker="#00008B" // Dark Blue, matches current theme accent
        />
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" disabled={isSubmitting || isTestingZapi}>
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}

