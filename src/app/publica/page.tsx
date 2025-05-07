'use client';

import { useAppContext } from '@/contexts/app-context';
import PublicBookingWizard from '@/components/public/public-booking-wizard';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import type { Agendamento, AgendamentoCreateDto, Cliente, ClienteCreateDto } from '@/types'; 

export default function PaginaPublica() {
  const { 
    servicos, 
    profissionais, 
    agendamentos, 
    configuracao,
    createAgendamento,
    createCliente, 
    clientes, // Get all clients to check for existing ones
    loadingServicos,
    loadingProfissionais,
    loadingAgendamentos,
    loadingConfiguracao,
    loadingClientes,
  } = useAppContext();


  const handleCompleteBooking = async (agendamentoData: AgendamentoCreateDto, clienteInputData: ClienteCreateDto): Promise<Agendamento | null> => {
    let cliente: Cliente | null | undefined = clientes.find(c => c.telefone === clienteInputData.telefone.replace(/\D/g, ''));

    if (!cliente) {
        cliente = await createCliente(clienteInputData);
    }

    if (!cliente) {
        return null;
    }

    const finalAgendamentoData: AgendamentoCreateDto = {
        ...agendamentoData,
        clienteId: cliente.id,
    };
    
    return createAgendamento(finalAgendamentoData);
  };
  
  const isLoading = loadingServicos || loadingProfissionais || loadingAgendamentos || loadingConfiguracao || loadingClientes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          {configuracao.logoBase64 ? (
            <Image 
              src={configuracao.logoBase64}
              alt={`Logo de ${configuracao.nomeEmpresa}`}
              width={150} 
              height={50} 
              className="mx-auto mb-4 rounded object-contain"
              data-ai-hint="company logo"
            />
          ) : (
            <div className="h-[50px] flex items-center justify-center mb-4">
                 <h2 className="text-2xl font-semibold text-primary">{configuracao.nomeEmpresa || 'Sua Empresa'}</h2>
            </div>
          )}
          <h1 className="text-4xl font-bold text-primary">Agende seu Horário</h1>
          <p className="text-lg text-muted-foreground mt-2">Rápido, fácil e seguro.</p>
        </header>

        {isLoading ? (
            <div className="w-full max-w-lg mx-auto">
                <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-6" />
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-between mt-6">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        ) : (
            <PublicBookingWizard
                allServicos={servicos}
                allProfissionais={profissionais}
                existingAgendamentos={agendamentos}
                onCompleteBooking={handleCompleteBooking}
                configuracao={configuracao}
            />
        )}
        
        <footer className="text-center mt-8 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {configuracao.nomeEmpresa || 'Nome da Empresa'}. Todos os direitos reservados.</p>
            {/* <p>Desenvolvido com ❤️ por Agenda Fácil</p> */}
        </footer>
      </div>
    </div>
  );
}