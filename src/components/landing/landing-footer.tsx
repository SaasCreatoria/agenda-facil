import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <CalendarDays className="h-6 w-6 text-primary hidden sm:block" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído por{' '}
            <a
              href="https://firebase.google.com/products/studio" // Placeholder, as actual author is AI
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Firebase Studio
            </a>
            .
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Agenda Fácil. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
