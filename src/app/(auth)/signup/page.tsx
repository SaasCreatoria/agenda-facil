
import SignupForm from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro | Agenda Fácil',
  description: 'Crie sua conta no Agenda Fácil.',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <SignupForm />
    </div>
  );
}
