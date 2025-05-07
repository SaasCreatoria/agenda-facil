
import LoginForm from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Agenda Fácil',
  description: 'Acesse sua conta Agenda Fácil.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <LoginForm />
    </div>
  );
}
