
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

export default function PaginaPublica() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          {/* Placeholder for company logo if available */}
          <Image 
            src="https://picsum.photos/150/50" // Replace with actual logo logic
            alt="Logo da Empresa" 
            width={150} 
            height={50} 
            className="mx-auto mb-4 rounded"
            data-ai-hint="company logo"
          />
          <h1 className="text-4xl font-bold text-primary">Agende seu Horário</h1>
          <p className="text-lg text-muted-foreground mt-2">Rápido, fácil e seguro.</p>
        </header>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Novo Agendamento</CardTitle>
            <CardDescription>Preencha os campos abaixo para marcar seu horário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço</Label>
                <Select>
                  <SelectTrigger id="servico">
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Populate with services from LocalStorage */}
                    <SelectItem value="corte">Corte de Cabelo</SelectItem>
                    <SelectItem value="manicure">Manicure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profissional">Profissional (Opcional)</Label>
                 <Select>
                  <SelectTrigger id="profissional">
                    <SelectValue placeholder="Qualquer um disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Populate with profissionals from LocalStorage */}
                    <SelectItem value="ana">Ana</SelectItem>
                    <SelectItem value="joao">João</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Horário Disponível</Label>
                <Select>
                  <SelectTrigger id="hora">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Populate with available times based on date/service/professional */}
                    <SelectItem value="0900">09:00</SelectItem>
                    <SelectItem value="1000">10:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6 mt-2">
                <h3 className="text-lg font-semibold text-foreground">Seus Dados</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="nomeCliente">Nome Completo</Label>
                        <Input id="nomeCliente" placeholder="Seu nome completo" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefoneCliente">Telefone (WhatsApp)</Label>
                        <Input id="telefoneCliente" type="tel" placeholder="(XX) XXXXX-XXXX" />
                    </div>
                 </div>
                <div className="space-y-2">
                    <Label htmlFor="emailCliente">Email (Opcional)</Label>
                    <Input id="emailCliente" type="email" placeholder="seuemail@exemplo.com" />
                </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="captcha">Verificação (Fictícia)</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <span className="italic text-muted-foreground select-none" data-ai-hint="captcha code">XYZ123</span>
                <Input id="captcha" placeholder="Digite o código acima" className="flex-1 bg-background" />
              </div>
            </div>
            
            <Button type="submit" className="w-full text-lg py-3">
              Confirmar Agendamento
            </Button>
          </CardContent>
        </Card>
        <footer className="text-center mt-8 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Nome da Empresa. Todos os direitos reservados.</p>
            <p>Desenvolvido com ❤️ por Agenda Fácil</p>
        </footer>
      </div>
    </div>
  );
}
