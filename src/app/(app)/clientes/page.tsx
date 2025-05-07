'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClienteList from '@/components/clientes/cliente-list';
import ClienteForm from '@/components/clientes/cliente-form';
import { useAppContext } from '@/contexts/app-context';
import type { Cliente, ClienteCreateDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientesPage() {
  const { 
    clientes, 
    loadingClientes, 
    createCliente, 
    updateCliente, 
    removeCliente,
    searchClientes,
    agendamentos // For checking future appointments before deletion
  } = useAppContext();
  
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedClientes, setDisplayedClientes] = useState<Cliente[]>(clientes);

  useEffect(() => {
    if(!loadingClientes) { // Ensure clientes are loaded before attempting to search
        setDisplayedClientes(searchClientes(searchTerm));
    }
  }, [searchTerm, clientes, searchClientes, loadingClientes]);


  const handleOpenForm = (cliente?: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingCliente(undefined);
    setIsFormOpen(false);
  };

  const handleSubmit = async (data: ClienteCreateDto | Cliente) => {
    let success = false;
    if (editingCliente) {
      const result = await updateCliente(editingCliente.id, data as Partial<Omit<Cliente, 'id'>>);
      success = !!result;
    } else {
      const result = await createCliente(data as ClienteCreateDto);
      success = !!result;
    }
    if (success) {
      handleCloseForm();
    }
  };

  const handleDeleteCliente = async (clienteId: string) => {
    const hasFutureAppointments = agendamentos.some(a => 
      a.clienteId === clienteId && 
      new Date(a.dataHora) > new Date() &&
      (a.status === 'PENDENTE' || a.status === 'CONFIRMADO')
    );

    if (hasFutureAppointments) {
      toast({
        variant: 'destructive',
        title: 'Não é possível excluir',
        description: 'Este cliente está vinculado a agendamentos futuros. Cancele ou reagende os agendamentos antes de excluir.',
        duration: 7000,
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await removeCliente(clienteId);
    }
  };

  return (
    <>
      <PageHeader 
        title="Clientes" 
        description="Gerencie sua base de clientes."
        actions={
          <Button onClick={() => handleOpenForm()} disabled={loadingClientes}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        }
      />
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>Visualize e gerencie todos os clientes.</CardDescription>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Buscar por nome ou telefone..." 
                        className="pl-8 w-full md:w-[250px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loadingClientes}
                    />
                </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingClientes ? (
             <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <ClienteList 
              clientes={displayedClientes}
              onEdit={handleOpenForm}
              onDelete={handleDeleteCliente}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          {isFormOpen && (
            <ClienteForm 
                initialData={editingCliente}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
                existingClientes={clientes}
            />
           )}
        </DialogContent>
      </Dialog>
    </>
  );
}