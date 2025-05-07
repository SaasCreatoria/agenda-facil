
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientesPage() {
  return (
    <>
      <PageHeader 
        title="Clientes" 
        description="Gerencie sua base de clientes."
        actions={<Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Visualize e gerencie todos os clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for table/list */}
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Tabela de clientes aparecerá aqui.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
