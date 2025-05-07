
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter no mínimo 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { saveUserToFirestore } = useAuth(); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: data.name });
        // The saveUserToFirestore function already sets onboardingCompleted to false by default.
        await saveUserToFirestore(firebaseUser, { displayName: data.name }); 
      }
      toast({ title: 'Conta criada!', description: 'Você foi registrado com sucesso. Redirecionando para o onboarding...' });
      router.push('/onboarding'); // Redirect to onboarding
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      }
      toast({ variant: 'destructive', title: 'Erro no Cadastro', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>Preencha seus dados para se registrar.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register('name')} disabled={isLoading} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} disabled={isLoading} />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} disabled={isLoading} />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Registrando...' : 'Registrar'}
          </Button>
           <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

