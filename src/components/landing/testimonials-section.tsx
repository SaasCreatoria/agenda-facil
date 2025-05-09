
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from 'lucide-react';

const clientLogos = [
  { name: 'CUBO Creative', dataAiHint: 'company logo' },
  { name: 'Pink Lash Studio', dataAiHint: 'company logo' },
  { name: 'Barberia Alpha', dataAiHint: 'company logo' },
  { name: 'Estética Renovare', dataAiHint: 'company logo' },
  { name: 'Pet Feliz', dataAiHint: 'company logo' },
];

const testimonials = [
  {
    name: 'Ana Silva',
    role: 'Dona de Salão',
    avatarSrc: 'https://picsum.photos/seed/ana/100/100',
    dataAiHint: 'woman portrait',
    rating: 5,
    comment:
      'O Agenda Fácil transformou a gestão do meu salão! Meus clientes adoram a facilidade de agendar online e os lembretes diminuíram muito os "furos".',
  },
  {
    name: 'Carlos Pereira',
    role: 'Barbeiro',
    avatarSrc: 'https://picsum.photos/seed/carlos/100/100',
    dataAiHint: 'man portrait',
    rating: 5,
    comment:
      'Plataforma super intuitiva e completa. Consigo ver todos os meus horários na palma da mão e meus clientes recebem confirmação na hora. Recomendo!',
  },
  {
    name: 'Juliana Costa',
    role: 'Esteticista',
    avatarSrc: 'https://picsum.photos/seed/juliana/100/100',
    dataAiHint: 'woman face',
    rating: 4,
    comment:
      'Desde que comecei a usar o Agenda Fácil, minha organização melhorou 100%. A página pública de agendamento é um diferencial enorme.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">
            São mais de 10.000 clientes satisfeitos!
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Veja o que alguns deles dizem sobre o Agenda Fácil e conheça algumas das marcas que confiam em nós.
          </p>
        </div>

        <div className="mb-12 md:mb-16">
            <h3 className="text-xl font-semibold text-center text-primary mb-6">Alguns de nossos parceiros:</h3>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {clientLogos.map((logo) => (
                <div key={logo.name} className="text-center">
                    {/* Placeholder for actual logos - using text for now */}
                    <p className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors" data-ai-hint={logo.dataAiHint}>{logo.name}</p>
                </div>
            ))}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatarSrc} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                    <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">"{testimonial.comment}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
