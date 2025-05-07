
import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
          <CalendarDays className="h-7 w-7" />
          <span className="font-bold text-lg">Agenda Fácil</span>
        </Link>
      </header>
      <main>{children}</main>
    </>
  );
}
