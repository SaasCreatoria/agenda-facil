
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicosPage() {
  return (
    <>
      <PageHeader 
        title="Serviços" 
        description="Gerencie os serviços oferecidos."
        actions={<Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço</Button>}
      />
       <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Visualize e gerencie todos os serviços.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for table/list */}
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Tabela de serviços aparecerá aqui.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
