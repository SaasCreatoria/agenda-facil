
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ConfiguracaoPage() {
  return (
    <>
      <PageHeader 
        title="Configuração" 
        description="Ajuste as configurações da sua empresa."
      />
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Empresa</CardTitle>
          <CardDescription>Informações básicas e preferências.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input id="nomeEmpresa" placeholder="Minha Empresa Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fusoHorario">Fuso Horário</Label>
              <Select>
                <SelectTrigger id="fusoHorario">
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</SelectItem>
                  <SelectItem value="Europe/Lisbon">Europe/Lisbon (GMT+1)</SelectItem>
                  {/* Add more IANA timezones as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoEmpresa">Logo da Empresa</Label>
            <Input id="logoEmpresa" type="file" />
            {/* Placeholder for logo preview */}
            <div className="mt-2 h-24 w-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground" data-ai-hint="logo placeholder">
              Preview
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="antecedenciaLembrete">Antecedência do Lembrete (horas)</Label>
              <Input id="antecedenciaLembrete" type="number" placeholder="24" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canalLembrete">Canal Padrão de Lembrete</Label>
              <Select>
                <SelectTrigger id="canalLembrete">
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
