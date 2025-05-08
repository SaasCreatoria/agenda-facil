
'use client';

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConfigForm from '@/components/configuracao/config-form';
import { useAppContext } from '@/contexts/app-context';
import type { ConfiguracaoEmpresa } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ConfiguracaoPage() {
  const { configuracao, loadingConfiguracao, updateConfiguracao, loadAgendamentos, loadLembretes } = useAppContext();

  const handleSubmit = async (data: ConfiguracaoEmpresa) => {
    const oldFuso = configuracao.fusoHorario;
    const oldAntecedencia = configuracao.antecedenciaLembreteHoras;

    await updateConfiguracao(data);
    
    // If critical settings that affect existing data processing changed, reload affected data
    if (data.fusoHorario !== oldFuso || data.antecedenciaLembreteHoras !== oldAntecedencia) {
        // These reloads might trigger re-evaluation of reminders, etc.
        loadAgendamentos(); // If timezone affects display or conflict logic related to stored dates
        loadLembretes(); // If reminder scheduling needs to be re-evaluated
    }
  };

  return (
    <>
      <PageHeader 
        title="Configuração" 
        description="Ajuste as configurações da sua empresa."
      />
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Empresa e Preferências</CardTitle>
          {/* <CardDescription>Informações básicas e preferências.</CardDescription> */}
        </CardHeader>
        <CardContent>
          {loadingConfiguracao ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-24 w-full" /> {/* Logo placeholder */}
                
                <Separator className="my-6 !mt-8 !mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" /> {/* Placeholder for "Configurações de Lembretes" title */}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" /> {/* antecedenciaLembreteHoras */}
                    <Skeleton className="h-10 w-full" /> {/* canalLembretePadrao */}
                </div>
                <Skeleton className="h-10 w-full" /> {/* zapierWhatsappWebhookUrl */}
                
                <Separator className="my-6 !mt-8 !mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" /> {/* Placeholder for "Personalização da Página Pública" title */}
                
                <Skeleton className="h-10 w-full" /> {/* publicPageTitle */}
                <Skeleton className="h-20 w-full" /> {/* publicPageWelcomeMessage (textarea) */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" /> {/* publicPagePrimaryColor */}
                    <Skeleton className="h-10 w-full" /> {/* publicPageAccentColor */}
                </div>

                <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
          ) : (
            <ConfigForm 
              initialData={configuracao}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}

