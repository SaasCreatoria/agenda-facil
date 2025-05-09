
import Link from 'next/link';
import { CalendarDays, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const footerNavs = [
  {
    label: "Sobre Nós",
    items: [
      { href: "/empresa", name: "Empresa" },
      { href: "/blog", name: "Blog" },
      { href: "/carreiras", name: "Carreiras" },
    ],
  },
  {
    label: "Produto",
    items: [
      { href: "#features", name: "Funcionalidades" },
      { href: "#pricing", name: "Planos e Preços" },
      { href: "/publica", name: "Página Pública Demo" },
    ],
  },
  {
    label: "Recursos",
    items: [
      { href: "/suporte", name: "Suporte" },
      { href: "/faq", name: "FAQ" },
      { href: "/termos", name: "Termos de Uso" },
      { href: "/privacidade", name: "Política de Privacidade" },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t bg-background text-muted-foreground">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:px-6">
        <div className="grid gap-8 mb-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1 xl:col-span-1">
            <Link href="/" className="inline-flex items-center mb-2 sm:mb-3">
              <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <span className="ml-2 text-lg sm:text-xl font-bold tracking-wide text-foreground">
                Agenda Fácil
              </span>
            </Link>
            <p className="text-xs sm:text-sm">
              Simplificando agendamentos para profissionais e seus clientes.
            </p>
            <div className="mt-3 sm:mt-4 flex space-x-2.5 sm:space-x-3">
              {socialLinks.map((social) => (
                <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {footerNavs.map((nav) => (
            <div key={nav.label}>
              <p className="font-semibold tracking-wide text-foreground text-sm sm:text-base">
                {nav.label}
              </p>
              <ul className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
                {nav.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="transition-colors duration-300 hover:text-primary text-xs sm:text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
           <div className="space-y-1.5 sm:space-y-2">
            <p className="font-semibold tracking-wide text-foreground text-sm sm:text-base">Baixe o App</p>
            <div className="flex flex-col space-y-2">
                <Button variant="outline" className="justify-start group h-9 sm:h-10 text-xs sm:text-sm" asChild>
                    <Link href="#" target="_blank" rel="noopener noreferrer">
                        <Image src="https://picsum.photos/seed/appstore/32/32" alt="App Store" width={20} height={20} className="mr-1.5 sm:mr-2 filter group-hover:brightness-110" data-ai-hint="apple store"/>
                        App Store
                    </Link>
                </Button>
                <Button variant="outline" className="justify-start group h-9 sm:h-10 text-xs sm:text-sm" asChild>
                     <Link href="#" target="_blank" rel="noopener noreferrer">
                        <Image src="https://picsum.photos/seed/playstore/32/32" alt="Google Play" width={20} height={20} className="mr-1.5 sm:mr-2 filter group-hover:brightness-110" data-ai-hint="google play"/>
                        Google Play
                    </Link>
                </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse justify-between pt-4 sm:pt-5 pb-4 sm:pb-5 border-t lg:flex-row text-center lg:text-left">
          <p className="text-xs sm:text-sm mt-2 lg:mt-0">
            &copy; {new Date().getFullYear()} Agenda Fácil. Todos os direitos reservados.
          </p>
          <p className="text-xs sm:text-sm">
            Construído com ❤️ por Firebase Studio.
          </p>
        </div>
      </div>
    </footer>
  );
}
