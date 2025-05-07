'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import type { ConfiguracaoEmpresa, ServicoCreateDto, ProfissionalCreateDto } from '@/types';

import OnboardingStepper from '@/components/onboarding/onboarding-stepper';
import ConfiguracaoOnboardingForm from '@/components/onboarding/configuracao-onboarding-form';
import ServicoOnboardingForm from '@/components/onboarding/servico-onboarding-form';
import ProfissionalOnboardingForm from '@/components/onboarding/profissional-onboarding-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 'configuracao', name: 'Empresa' },
  { id: 'servico', name: 'Serviço' },
  { id: 'profissional', name: 'Profissional' },
  { id: 'concluido', name: 'Concluído' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUserOnboardingStatus } = useAuth();
  const { configuracao, updateConfiguracao, createServico, createProfissional } = useAppContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Store IDs or key data from previous steps
  const [createdServicoId, setCreatedServicoId] = useState<string | null>(null);

  const handleConfigSubmit = async (data: Partial<ConfiguracaoEmpresa>) => {
    setIsProcessing(true);
    // Merge with existing default config aspects not covered by form
    const fullConfigData = { 
        ...configuracao, 
        nomeEmpresa: data.nomeEmpresa || configuracao.nomeEmpresa,
        fusoHorario: data.fusoHorario || configuracao.fusoHorario,
    };
    await updateConfiguracao(fullConfigData);
    setIsProcessing(false);
    setCurrentStep(1);
    return true;
  };

  const handleServicoSubmit = async (data: ServicoCreateDto) => {
    setIsProcessing(true);
    const newServico = await createServico(data);
    setIsProcessing(false);
    if (newServico) {
      setCreatedServicoId(newServico.id);
      setCurrentStep(2);
      return newServico.id;
    }
    return null;
  };

  const handleProfissionalSubmit = async (data: ProfissionalCreateDto) => {
    setIsProcessing(true);
    const success = await createProfissional(data);
    setIsProcessing(false);
    if (success && user) {
      await updateUserOnboardingStatus(user.uid, true);
      setCurrentStep(3); // Move to "Concluído" step
      return true;
    }
    return false;
  };
  
  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConfiguracaoOnboardingForm
            initialData={{ nomeEmpresa: configuracao.nomeEmpresa, fusoHorario: configuracao.fusoHorario }}
            onSubmit={handleConfigSubmit}
            onProcessing={setIsProcessing}
          />
        );
      case 1:
        return (
          <ServicoOnboardingForm
            onSubmit={handleServicoSubmit}
            onBack={() => setCurrentStep(0)}
            onProcessing={setIsProcessing}
          />
        );
      case 2:
        if (!createdServicoId) {
            // Should not happen if flow is correct, but handle defensively
            return <p>Erro: Serviço não definido. Por favor, volte ao passo anterior.</p>;
        }
        return (
          <ProfissionalOnboardingForm
            servicoId={createdServicoId}
            onSubmit={handleProfissionalSubmit}
            onBack={() => setCurrentStep(1)}
            onProcessing={setIsProcessing}
          />
        );
      case 3:
        return (
             <Card className="w-full text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Onboarding Concluído!</CardTitle>
                    <CardDescription>Sua configuração inicial está pronta. Você já pode começar a usar o Agenda Fácil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6">Clique abaixo para acessar seu painel de controle.</p>
                    <Button onClick={goToDashboard} size="lg">
                        Ir para o Dashboard
                    </Button>
                </CardContent>
            </Card>
        );
      default:
        return <p>Passo desconhecido.</p>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Bem-vindo(a) ao Agenda Fácil!</h1>
          <p className="text-muted-foreground">Vamos configurar sua conta rapidamente.</p>
        </div>
        
        {currentStep < 3 && ( // Don't show stepper on "Concluído" step
          <OnboardingStepper steps={ONBOARDING_STEPS.slice(0, -1)} currentStep={currentStep} />
        )}

        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
