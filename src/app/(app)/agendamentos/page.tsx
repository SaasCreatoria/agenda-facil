
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgendamentosPage() {
  return (
    <>
      <PageHeader 
        title="Agendamentos" 
        description="Gerencie seus agendamentos."
        actions={<Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>Filtre e visualize todos os agendamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for table/list and filters */}
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Tabela de agendamentos e filtros aparecerão aqui.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
