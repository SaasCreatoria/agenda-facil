
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Servico, Profissional, AgendamentoCreateDto, ClienteCreateDto, Agendamento, Cliente, ConfiguracaoEmpresa } from '@/types';
import { formatDateTime, isValidEmail, isValidPhoneNumber, maskPhoneNumber } from '@/utils/helpers';
import { checkConflict } from '@/utils/appointment-helpers';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CalendarDays, User, Scissors, Clock, CheckCircle, ShieldCheck, UserCircle2 } from 'lucide-react'; // Added ShieldCheck for CAPTCHA

interface PublicBookingWizardProps {
  allServicos: Servico[];
  allProfissionais: Profissional[];
  existingAgendamentos: Agendamento[];
  onCompleteBooking: (agendamentoData: AgendamentoCreateDto, clienteData: ClienteCreateDto) => Promise<Agendamento | null>;
  configuracao: ConfiguracaoEmpresa;
}

const STEPS = [
  { id: 'servico', title: 'Escolha o Serviço', icon: Scissors },
  { id: 'profissional', title: 'Escolha o Profissional', icon: User },
  { id: 'datahora', title: 'Escolha Data e Horário', icon: CalendarDays },
  { id: 'dados', title: 'Seus Dados', icon: UserCircle2 },
  { id: 'confirmacao', title: 'Confirmação', icon: CheckCircle },
];

export default function PublicBookingWizard({ 
    allServicos, 
    allProfissionais, 
    existingAgendamentos, 
    onCompleteBooking,
    configuracao 
}: PublicBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServicoId, setSelectedServicoId] = useState<string>('');
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>(''); // Default to "any"
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const selectedServico = useMemo(() => allServicos.find(s => s.id === selectedServicoId && s.ativo), [allServicos, selectedServicoId]);
  
  const availableProfissionais = useMemo(() => {
    if (!selectedServico) return [];
    return allProfissionais.filter(p => p.servicosIds.includes(selectedServico.id) && p.ativo);
  }, [allProfissionais, selectedServico]);

  const professionalForTimeSlots = useMemo(() => {
    if(selectedProfissionalId) return availableProfissionais.find(p => p.id === selectedProfissionalId);
    if(availableProfissionais.length === 1) return availableProfissionais[0]; 
    return undefined; 
  }, [availableProfissionais, selectedProfissionalId]);


  const availableTimeSlots = useMemo(() => {
    if (!selectedServico || !professionalForTimeSlots || !selectedDate) return [];
    
    const slots: string[] = [];
    const professionalAvailability = professionalForTimeSlots.horariosDisponiveis.find(
      h => h.diaSemana === new Date(selectedDate).getUTCDay() 
    );

    if (!professionalAvailability) return [];

    const serviceDuration = selectedServico.duracaoMinutos;
    const slotDate = new Date(selectedDate); 
    
    let currentTime = new Date(Date.UTC(slotDate.getUTCFullYear(), slotDate.getUTCMonth(), slotDate.getUTCDate(), 
                               parseInt(professionalAvailability.inicio.split(':')[0]), 
                               parseInt(professionalAvailability.inicio.split(':')[1])));
    
    const endTime = new Date(Date.UTC(slotDate.getUTCFullYear(), slotDate.getUTCMonth(), slotDate.getUTCDate(),
                             parseInt(professionalAvailability.fim.split(':')[0]),
                             parseInt(professionalAvailability.fim.split(':')[1])));

    if (isNaN(currentTime.getTime()) || isNaN(endTime.getTime())) {
        console.error("Invalid time string for professional availability:", professionalAvailability);
        return []; 
    }

    while (new Date(currentTime.getTime() + serviceDuration * 60000) <= endTime) {
      const slotTime = `${currentTime.getUTCHours().toString().padStart(2, '0')}:${currentTime.getUTCMinutes().toString().padStart(2, '0')}`;

      const proposedAgendamento = {
        id: '', 
        dataHora: new Date(Date.UTC(slotDate.getUTCFullYear(), slotDate.getUTCMonth(), slotDate.getUTCDate(),
                                    parseInt(slotTime.split(':')[0]), parseInt(slotTime.split(':')[1]))).toISOString(),
        profissionalId: professionalForTimeSlots.id,
        servicoId: selectedServico.id,
        duracaoMinutos: serviceDuration,
      };
      
      const conflict = checkConflict(proposedAgendamento, existingAgendamentos);
      if (!conflict) {
        slots.push(slotTime);
      }
      currentTime = new Date(currentTime.getTime() + 30 * 60000); 
    }
    return slots;
  }, [selectedServico, professionalForTimeSlots, selectedDate, existingAgendamentos]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleBooking = async () => {
    if (!selectedServico || !professionalForTimeSlots || !selectedDate || !selectedTime) {
        toast({variant: 'destructive', title: "Informações incompletas", description: "Por favor, preencha todos os campos obrigatórios."});
        return;
    }
    if(!clienteNome.trim() || !isValidPhoneNumber(clienteTelefone.replace(/\D/g, ''))) {
        toast({variant: 'destructive', title: "Dados do cliente inválidos", description: "Nome e telefone válido são obrigatórios."});
        setCurrentStep(STEPS.findIndex(s => s.id === 'dados')); 
        return;
    }
    if(clienteEmail && !isValidEmail(clienteEmail)){
        toast({variant: 'destructive', title: "Email inválido", description: "Por favor, insira um email válido ou deixe em branco."});
        setCurrentStep(STEPS.findIndex(s => s.id === 'dados'));
        return;
    }
    if(!isCaptchaChecked && currentStep === STEPS.findIndex(s => s.id === 'confirmacao')){
        toast({variant: 'destructive', title: "Verificação necessária", description: "Por favor, confirme que você não é um robô."});
        return;
    }

    setIsSubmitting(true);
    const slotDate = new Date(selectedDate);
    const agendamentoData: AgendamentoCreateDto = {
      clienteId: '', 
      profissionalId: professionalForTimeSlots.id,
      servicoId: selectedServico.id,
      dataHora: new Date(Date.UTC(slotDate.getUTCFullYear(), slotDate.getUTCMonth(), slotDate.getUTCDate(), 
                                   parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1]))).toISOString(),
      duracaoMinutos: selectedServico.duracaoMinutos,
      status: 'PENDENTE', 
      observacoes: 'Agendado via página pública',
    };
    const clienteData: ClienteCreateDto = {
        nome: clienteNome,
        telefone: clienteTelefone.replace(/\D/g, ''),
        email: clienteEmail || undefined,
    };

    const result = await onCompleteBooking(agendamentoData, clienteData);
    if (result) {
      toast({ 
        title: 'Agendamento Confirmado!', 
        description: `Seu protocolo é ${result.id.substring(0,8)}. Você receberá um lembrete.`,
        duration: 10000 
      });
      setCurrentStep(0);
      setSelectedServicoId('');
      setSelectedProfissionalId('');
      setSelectedDate('');
      setSelectedTime('');
      setClienteNome('');
      setClienteTelefone('');
      setClienteEmail('');
      setIsCaptchaChecked(false);
    }
    setIsSubmitting(false);
  };

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentIcon = STEPS[currentStep].icon;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Tomorrow;
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2 text-primary">
            <CurrentIcon size={28} strokeWidth={2.5}/>
        </div>
        <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
        <Progress value={progressValue} className="w-full mt-2 h-2" />
        <CardDescription className="text-xs mt-1">
            Passo {currentStep + 1} de {STEPS.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px]">
        {currentStep === 0 && (
          <div className="space-y-4">
            <Label htmlFor="servico">Serviço Desejado</Label>
            <Select value={selectedServicoId} onValueChange={setSelectedServicoId}>
              <SelectTrigger id="servico"><SelectValue placeholder="Escolha um serviço..." /></SelectTrigger>
              <SelectContent>
                {allServicos.filter(s=>s.ativo).map(s => <SelectItem key={s.id} value={s.id}>{s.nome} ({s.duracaoMinutos} min - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.preco)})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <Label htmlFor="profissional">Profissional</Label>
            <Select value={selectedProfissionalId} onValueChange={setSelectedProfissionalId} disabled={!selectedServico || availableProfissionais.length === 0}>
              <SelectTrigger id="profissional"><SelectValue placeholder={!selectedServico ? "Escolha um serviço primeiro" : (availableProfissionais.length === 0 ? "Nenhum disponível p/ este serviço" : "Qualquer um disponível")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer um disponível</SelectItem>
                {availableProfissionais.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedServico && availableProfissionais.length === 0 && <p className="text-sm text-destructive mt-1">Nenhum profissional oferece este serviço no momento.</p>}
            {!selectedProfissionalId && availableProfissionais.length > 1 && <p className="text-sm text-muted-foreground mt-1">Ao selecionar "Qualquer um", o sistema escolherá o primeiro profissional disponível.</p>}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={selectedDate} onChange={e => {setSelectedDate(e.target.value); setSelectedTime('');}} min={minDate.toISOString().split('T')[0]}/>
            </div>
            {selectedDate && selectedServico && professionalForTimeSlots && (
              <div>
                <Label htmlFor="hora">Horário Disponível</Label>
                {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {availableTimeSlots.map(time => (
                            <Button key={time} variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)}>
                                <Clock className="mr-1.5 h-3.5 w-3.5" />{time}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-3 text-center border rounded-md mt-1">Nenhum horário disponível para esta data/profissional/serviço. Tente outra data.</p>
                )}
              </div>
            )}
             {selectedServico && !professionalForTimeSlots && availableProfissionais.length > 1 && currentStep === 2 && (
                <p className="text-sm text-muted-foreground mt-1">Por favor, selecione um profissional específico na etapa anterior para ver os horários.</p>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nomeCliente">Nome Completo</Label>
              <Input id="nomeCliente" value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <Label htmlFor="telefoneCliente">Telefone (WhatsApp)</Label>
              <Input id="telefoneCliente" type="tel" value={clienteTelefone} onChange={e => setClienteTelefone(maskPhoneNumber(e.target.value))} placeholder="(XX) XXXXX-XXXX" />
            </div>
            <div>
              <Label htmlFor="emailCliente">Email (Opcional)</Label>
              <Input id="emailCliente" type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} placeholder="seuemail@exemplo.com" />
            </div>
          </div>
        )}
        
        {currentStep === 4 && (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-base mb-2">Resumo do Agendamento:</h3>
            <p><strong>Serviço:</strong> {selectedServico?.nome}</p>
            <p><strong>Profissional:</strong> {professionalForTimeSlots?.nome || 'Primeiro disponível'}</p>
            <p><strong>Data e Hora:</strong> {selectedDate && selectedTime ? formatDateTime(new Date(`${selectedDate}T${selectedTime}`)) : 'Não definido'}</p>
            <p><strong>Duração:</strong> {selectedServico?.duracaoMinutos} minutos</p>
            <p><strong>Preço:</strong> {selectedServico ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedServico.preco) : 'N/A'}</p>
            <hr className="my-3"/>
            <h3 className="font-semibold text-base mb-1">Seus Dados:</h3>
            <p><strong>Nome:</strong> {clienteNome}</p>
            <p><strong>Telefone:</strong> {clienteTelefone}</p>
            {clienteEmail && <p><strong>Email:</strong> {clienteEmail}</p>}
            
            <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="captcha" checked={isCaptchaChecked} onCheckedChange={() => setIsCaptchaChecked(!isCaptchaChecked)} />
                <Label htmlFor="captcha" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1.5 text-muted-foreground"/> Não sou um robô
                </Label>
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
            <ArrowLeft className="mr-1.5 h-4 w-4"/> Voltar
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={nextStep} disabled={
            (currentStep === 0 && !selectedServicoId) ||
            (currentStep === 1 && !selectedServico) || 
            (currentStep === 2 && (!selectedDate || !selectedTime || !selectedServico || !professionalForTimeSlots)) ||
            (currentStep === 3 && (!clienteNome.trim() || !isValidPhoneNumber(clienteTelefone.replace(/\D/g, '')) || (clienteEmail && !isValidEmail(clienteEmail)) ) )
          }>
            Avançar <ArrowRight className="ml-1.5 h-4 w-4"/>
          </Button>
        ) : (
          <Button onClick={handleBooking} disabled={!isCaptchaChecked || isSubmitting}>
            {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}


    