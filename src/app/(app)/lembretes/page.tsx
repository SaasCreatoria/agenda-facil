
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LembretesPage() {
  return (
    <>
      <PageHeader 
        title="Lembretes" 
        description="Revise e gerencie os lembretes agendados."
      />
      <Card>
        <CardHeader>
          <CardTitle>Lembretes Agendados</CardTitle>
          <CardDescription>Visualize o status dos lembretes.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for list of reminders */}
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Lista de lembretes aparecerá aqui.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
