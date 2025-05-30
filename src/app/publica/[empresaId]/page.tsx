

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Phone as PhoneIcon, Mail as MailIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PublicBookingWizard from '@/components/public/public-booking-wizard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Agendamento, AgendamentoCreateDto, Cliente, ClienteCreateDto, ConfiguracaoEmpresa, Servico, Profissional, Testimonial } from '@/types'; 
import { db } from '@/firebase/config';
import { collection, doc, getDoc, getDocs, addDoc, query, where, serverTimestamp, Timestamp, collectionGroup, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { maskCurrency } from '@/utils/helpers';

// Placeholder data for testimonials - replace with actual data fetching
const placeholderTestimonials: Omit<Testimonial, 'empresaId' | 'id'>[] = [
  { clienteNome: 'Joana Silva', comentario: 'Serviço incrível, recomendo a todos! Profissionais muito atenciosos.', rating: 5, data: new Date().toISOString() },
  { clienteNome: 'Pedro Alves', comentario: 'Ótimo atendimento e resultado perfeito. Voltarei sempre!', rating: 4, data: new Date().toISOString() },
  { clienteNome: 'Mariana Costa', comentario: 'Ambiente agradável e serviço de alta qualidade. Adorei!', rating: 5, data: new Date().toISOString() },
];


export default function PaginaPublicaEmpresa() {
  const params = useParams();
  const empresaIdOrSlug = params.empresaId as string; // This can be either ID or slug
  const { toast } = useToast();
  const router = useRouter();

  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEmpresa | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]); 

  const [loading, setLoading] = useState(true);

  const activeServicos = useMemo(() => servicos.filter(s => s.ativo), [servicos]);
  const activeProfissionais = useMemo(() => profissionais.filter(p => p.ativo), [profissionais]);

  useEffect(() => {
    const resolveEmpresaId = async () => {
        if (!empresaIdOrSlug) {
            setLoading(false);
            console.error("Empresa ID ou Slug ausente.");
            toast({variant: "destructive", title: "Página não encontrada", description: "O link parece estar incorreto."});
            router.push('/'); // Or a 404 page
            return;
        }

        // Try fetching by direct ID first (common case)
        const configDocRefById = doc(db, 'users', empresaIdOrSlug, 'configuracao', 'main');
        const configSnapById = await getDoc(configDocRefById);

        if (configSnapById.exists()) {
            setEmpresaId(empresaIdOrSlug);
            return;
        }

        // If not found by ID, try searching by slug
        const q = query(collectionGroup(db, 'configuracao'), where("publicPageSlug", "==", empresaIdOrSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const foundDoc = querySnapshot.docs[0];
            const resolvedId = foundDoc.ref.parent.parent?.id; // users/{userId}/configuracao/main
            if (resolvedId) {
                setEmpresaId(resolvedId);
                return;
            }
        }
        
        // If neither ID nor slug match
        setLoading(false);
        toast({variant: "destructive", title: "Página não encontrada", description: "Não foi possível encontrar a empresa especificada."});
        router.push('/'); // Or a 404 page
    };
    resolveEmpresaId();
  }, [empresaIdOrSlug, router, toast]);


  useEffect(() => {
    if (!empresaId) {
      // setLoading will be handled by resolveEmpresaId if it fails
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const configDocRef = doc(db, 'users', empresaId, 'configuracao', 'main');
        const configSnap = await getDoc(configDocRef);
        if (configSnap.exists()) {
          const configData = configSnap.data() as ConfiguracaoEmpresa;
          setConfiguracao({
            ...configData,
            criadoEm: configData.criadoEm instanceof Timestamp ? configData.criadoEm.toDate().toISOString() : configData.criadoEm,
            atualizadoEm: configData.atualizadoEm instanceof Timestamp ? configData.atualizadoEm.toDate().toISOString() : configData.atualizadoEm,
          });
        } else {
          throw new Error("Configuração da empresa não encontrada.");
        }

        const servicosColRef = collection(db, 'users', empresaId, 'servicos');
        const servicosQuery = query(servicosColRef, where("ativo", "==", true));
        const servicosSnap = await getDocs(servicosQuery);
        setServicos(servicosSnap.docs.map(d => ({ id: d.id, ...d.data() } as Servico)));

        const profColRef = collection(db, 'users', empresaId, 'profissionais');
        const profQuery = query(profColRef, where("ativo", "==", true));
        const profSnap = await getDocs(profQuery);
        setProfissionais(profSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profissional)));
        
        const agendamentosColRef = collection(db, 'users', empresaId, 'agendamentos');
        const agendamentosSnap = await getDocs(agendamentosColRef);
        setAgendamentos(agendamentosSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id, ...data,
                dataHora: data.dataHora instanceof Timestamp ? data.dataHora.toDate().toISOString() : data.dataHora,
            } as Agendamento;
        }));

        const clientesColRef = collection(db, 'users', empresaId, 'clientes');
        const clientesSnap = await getDocs(clientesColRef);
        setClientes(clientesSnap.docs.map(d => ({id: d.id, ...d.data()} as Cliente)));

        const testimonialsColRef = collection(db, 'users', empresaId, 'testimonials');
        const testimonialsQuery = query(testimonialsColRef, orderBy('data', 'desc'), where("rating", ">=", 4)); // Example: show only high-rated
        const testimonialsSnap = await getDocs(testimonialsQuery);
        if (testimonialsSnap.empty && placeholderTestimonials.length > 0) {
             setTestimonials(placeholderTestimonials.map((t,i) => ({...t, id: `placeholder-${i}`, empresaId})));
        } else {
            setTestimonials(testimonialsSnap.docs.map(d => ({id: d.id, ...d.data(), data: (d.data().data as Timestamp).toDate().toISOString() } as Testimonial)));
        }

      } catch (error) {
        console.error("Error fetching public page data:", error);
        toast({ variant: "destructive", title: "Erro ao carregar página", description: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empresaId, toast]);

  const handleCompleteBooking = async (agendamentoData: AgendamentoCreateDto, clienteInputData: ClienteCreateDto): Promise<Agendamento | null> => {
    if (!empresaId || !configuracao) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Configuração da empresa não carregada.' });
      return null;
    }

    let cliente: Cliente | undefined = clientes.find(c => c.telefone === clienteInputData.telefone.replace(/\D/g, ''));

    try {
        if (!cliente) {
            const clientesCollectionRef = collection(db, 'users', empresaId, 'clientes');
            const newClienteData = {
                ...clienteInputData,
                criadoEm: serverTimestamp(),
                atualizadoEm: serverTimestamp(),
            };
            const clienteDocRef = await addDoc(clientesCollectionRef, newClienteData);
            cliente = { id: clienteDocRef.id, ...newClienteData, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }; 
            setClientes(prev => [...prev, cliente!]); 
        }

        if (!cliente) {
            toast({ variant: 'destructive', title: 'Erro ao criar cliente.' });
            return null;
        }

        const finalAgendamentoDataForFirestore = {
            ...agendamentoData,
            clienteId: cliente.id,
            clienteNome: cliente.nome, 
            servicoNome: servicos.find(s => s.id === agendamentoData.servicoId)?.nome || 'N/A', 
            profissionalNome: profissionais.find(p => p.id === agendamentoData.profissionalId)?.nome || 'N/A', 
            dataHora: Timestamp.fromDate(new Date(agendamentoData.dataHora)),
            criadoEm: serverTimestamp(),
            atualizadoEm: serverTimestamp(),
        };
        
        const agendamentosCollectionRef = collection(db, 'users', empresaId, 'agendamentos');
        const agendamentoDocRef = await addDoc(agendamentosCollectionRef, finalAgendamentoDataForFirestore);
        
        const newAgendamento = { 
            ...agendamentoData, 
            id: agendamentoDocRef.id, 
            clienteId: cliente.id, 
            clienteNome: cliente.nome,
            servicoNome: finalAgendamentoDataForFirestore.servicoNome,
            profissionalNome: finalAgendamentoDataForFirestore.profissionalNome,
            criadoEm: new Date().toISOString(), 
            atualizadoEm: new Date().toISOString() 
        };
        setAgendamentos(prev => [...prev, newAgendamento]); 
        return newAgendamento;

    } catch (error) {
        console.error("Error completing booking:", error);
        toast({ variant: 'destructive', title: 'Erro ao realizar agendamento', description: (error as Error).message });
        return null;
    }
  };
  
  const dynamicStyles = !loading && configuracao && (configuracao.publicPagePrimaryColor || configuracao.publicPageAccentColor) ? `
    .public-dynamic-theme {
      ${configuracao.publicPagePrimaryColor ? `--primary-hsl: ${configuracao.publicPagePrimaryColor}; --primary: hsl(var(--primary-hsl));` : ''}
      ${configuracao.publicPageAccentColor ? `--accent-hsl: ${configuracao.publicPageAccentColor}; --accent: hsl(var(--accent-hsl));` : ''}
    }
    .public-dynamic-theme .bg-primary { background-color: hsl(var(--primary-hsl, var(--primary))); }
    .public-dynamic-theme .text-primary { color: hsl(var(--primary-hsl, var(--primary))); }
    .public-dynamic-theme .border-primary { border-color: hsl(var(--primary-hsl, var(--primary))); }
    /* etc. for accent and other theme colors */
  ` : '';


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
        <Skeleton className="h-16 w-48 mb-4" />
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!configuracao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Oops!</h1>
        <p className="text-muted-foreground">Não foi possível carregar as informações desta página.</p>
        <p className="text-sm text-muted-foreground mt-1">Verifique o link ou tente novamente mais tarde.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Voltar para Início</Button>
      </div>
    );
  }
  
  const pageTitle = configuracao.publicPageTitle || configuracao.nomeEmpresa || "Agendamentos";
  const welcomeMessage = configuracao.publicPageWelcomeMessage || 'Bem-vindo(a) à nossa página de agendamentos!';
  const businessNameForFooter = configuracao.nomeEmpresa || "Sua Empresa";


  return (
    <>
      {dynamicStyles && <style>{dynamicStyles}</style>}
      <div className="public-dynamic-theme min-h-screen bg-background text-foreground">
        <header 
            className="relative py-16 sm:py-24 text-center bg-muted/20 overflow-hidden"
            style={configuracao.heroBannerBase64 ? { backgroundImage: `url(${configuracao.heroBannerBase64})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div 
            className={`absolute inset-0 ${configuracao.heroBannerBase64 ? 'bg-black/50' : ''}`} 
          />
          <div className="container relative z-10 px-4">
            {configuracao.logoBase64 && (
              <Image 
                src={configuracao.logoBase64}
                alt={`Logo de ${configuracao.nomeEmpresa || 'empresa'}`}
                width={120} 
                height={120} 
                className="mx-auto mb-4 rounded-full shadow-lg border-2 border-background object-contain h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32"
                data-ai-hint="company logo"
              />
            )}
            <h1 className={`text-4xl sm:text-5xl font-bold ${configuracao.heroBannerBase64 ? 'text-primary-foreground' : 'text-primary'}`}>{pageTitle}</h1>
            <p className={`mt-2 text-lg sm:text-xl max-w-2xl mx-auto ${configuracao.heroBannerBase64 ? 'text-muted-foreground brightness-150 contrast-125' : 'text-muted-foreground'}`}>{welcomeMessage}</p>
            <Button size="lg" className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => document.getElementById('booking-wizard')?.scrollIntoView({ behavior: 'smooth' })}>
              Agendar Agora
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 sm:py-12">
          <section id="services" className="mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">Nossos Serviços</h2>
            {activeServicos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServicos.slice(0, 6).map(servico => ( 
                  <Card key={servico.id} className="shadow-lg hover:shadow-primary/20 transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{servico.nome}</CardTitle>
                      <CardDescription>{servico.descricao || 'Serviço especializado para você.'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold text-primary">{maskCurrency(servico.preco)}</p>
                      <p className="text-sm text-muted-foreground">Duração: {servico.duracaoMinutos} min</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nenhum serviço disponível no momento.</p>
            )}
             {activeServicos.length > 6 && (
                 <div className="text-center mt-8">
                    <Button variant="outline" onClick={() => document.getElementById('booking-wizard')?.scrollIntoView({ behavior: 'smooth' })}>Ver todos os serviços e agendar</Button>
                 </div>
             )}
          </section>

          <section id="testimonials" className="mb-12 sm:mb-16 bg-muted/30 py-12 rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">O que nossos clientes dizem</h2>
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {testimonials.map(testimonial => (
                  <Card key={testimonial.id} className="shadow-md bg-background">
                    <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${testimonial.clienteNome.split(' ')[0]}/40/40`} alt={testimonial.clienteNome} data-ai-hint="person avatar" />
                        <AvatarFallback>{testimonial.clienteNome.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-md">{testimonial.clienteNome}</CardTitle>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < testimonial.rating ? "currentColor" : "none"} />)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground italic">"{testimonial.comentario}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
                 <p className="text-center text-muted-foreground">Ainda não temos depoimentos públicos.</p>
            )}
          </section>
          
          <section id="booking-wizard" className="py-8">
             <h2 className="text-3xl font-bold text-center mb-2 text-primary">Faça seu Agendamento</h2>
             <p className="text-center text-muted-foreground mb-8">Selecione o serviço, profissional e horário de sua preferência.</p>
            <PublicBookingWizard
              allServicos={activeServicos}
              allProfissionais={activeProfissionais}
              existingAgendamentos={agendamentos}
              onCompleteBooking={handleCompleteBooking}
              configuracao={configuracao}
            />
          </section>
        </main>

        <footer className="border-t bg-muted/20 py-8 text-center">
          <div className="container">
            <p className="font-semibold text-primary">{businessNameForFooter}</p>
            <p className="text-xs text-muted-foreground mt-4">&copy; {new Date().getFullYear()} {businessNameForFooter}. Todos os direitos reservados.</p>
             <p className="text-xs text-muted-foreground mt-1">
                Desenvolvido com <a href="https://firebase.google.com/products/studio" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">Firebase Studio</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
    

