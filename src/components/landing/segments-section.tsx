
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const segments = [
  {
    name: 'Barbearias',
    imageSrc: 'https://picsum.photos/seed/barber/400/300',
    dataAiHint: 'barber shop',
  },
  {
    name: 'Salões de Beleza',
    imageSrc: 'https://picsum.photos/seed/salon/400/300',
    dataAiHint: 'beauty salon',
  },
  {
    name: 'Estúdios de Tatuagem',
    imageSrc: 'https://picsum.photos/seed/tattoo/400/300',
    dataAiHint: 'tattoo studio',
  },
  {
    name: 'Pet Shops',
    imageSrc: 'https://picsum.photos/seed/petshop/400/300',
    dataAiHint: 'pet shop',
  },
    {
    name: 'Clínicas de Estética',
    imageSrc: 'https://picsum.photos/seed/esthetics/400/300',
    dataAiHint: 'esthetics clinic',
  },
  {
    name: 'Consultórios',
    imageSrc: 'https://picsum.photos/seed/consultorio/400/300',
    dataAiHint: 'medical office',
  },
];

export default function SegmentsSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
            Para Todos
          </div>
          <h2 className="text-2xl font-bold tracking-tighter text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
            Segmentos que crescem com Agenda Fácil
          </h2>
          <p className="max-w-[700px] text-base text-muted-foreground sm:text-lg md:text-xl/relaxed">
            Seja qual for o seu ramo, nossa plataforma se adapta às suas necessidades.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {segments.map((segment) => (
            <Card key={segment.name} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative h-40 sm:h-48 w-full">
                <Image
                  src={segment.imageSrc}
                  alt={segment.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={segment.dataAiHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
              </div>
              <CardContent className="p-3 sm:p-4 relative z-10 -mt-10 sm:-mt-12">
                <h3 className="text-lg sm:text-xl font-semibold text-primary-foreground group-hover:text-primary transition-colors">{segment.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
