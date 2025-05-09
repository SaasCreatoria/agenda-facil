
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Testimonial, TestimonialCreateDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';

export function useTestimonials(targetEmpresaId?: string) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth(); // Logged-in user for creating/managing THEIR testimonials

  // Use targetEmpresaId for loading public testimonials, or logged-in user's ID for admin
  const empresaIdForOperations = targetEmpresaId || user?.uid;

  const loadTestimonials = useCallback(async () => {
    if (!empresaIdForOperations) {
      setTestimonials([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const testimonialsCollectionRef = collection(db, 'users', empresaIdForOperations, 'testimonials');
      const q = query(testimonialsCollectionRef, orderBy('data', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedTestimonials: Testimonial[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedTestimonials.push({ 
          id: docSnap.id, 
          ...data,
          data: data.data instanceof Timestamp ? data.data.toDate().toISOString() : data.data,
        } as Testimonial);
      });
      setTestimonials(fetchedTestimonials);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar depoimentos', description: (error as Error).message });
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, [empresaIdForOperations, toast]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const createTestimonial = async (data: TestimonialCreateDto): Promise<Testimonial | null> => {
    if (!user) { // Creation is always tied to the logged-in user for their business
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Você precisa estar logado para adicionar um depoimento.' });
      return null;
    }
    
    try {
      const testimonialsCollectionRef = collection(db, 'users', user.uid, 'testimonials');
      const testimonialData = {
        ...data,
        empresaId: user.uid, // Explicitly set for clarity, though path implies it
        data: serverTimestamp(), // Firestore server timestamp for the date of testimonial
        rating: Number(data.rating)
      };
      const docRef = await addDoc(testimonialsCollectionRef, testimonialData);
      const newTestimonial: Testimonial = { 
        id: docRef.id, 
        ...data, 
        empresaId: user.uid,
        data: new Date().toISOString(), // Approximate for UI
        rating: Number(data.rating)
      };
      setTestimonials(prev => [...prev, newTestimonial].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      toast({ title: 'Depoimento adicionado', description: `O depoimento de "${newTestimonial.clienteNome}" foi salvo.` });
      return newTestimonial;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast({ variant: 'destructive', title: 'Erro ao adicionar depoimento', description: (error as Error).message });
      return null;
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Omit<Testimonial, 'id' | 'empresaId' | 'data'>>): Promise<Testimonial | null> => {
     if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado' });
      return null;
    }
    try {
      const testimonialDocRef = doc(db, 'users', user.uid, 'testimonials', id);
      const updateData = {
        ...updates,
        ...(updates.rating && { rating: Number(updates.rating) }),
        // data field is not typically updated, but if it were:
        // ...(updates.data && { data: Timestamp.fromDate(new Date(updates.data)) })
      };
      await updateDoc(testimonialDocRef, updateData);
      
      const updatedTestimonialLocal: Testimonial = { 
          ...(testimonials.find(t => t.id ===id) as Testimonial),
          ...updates,
          ...(updates.rating && { rating: Number(updates.rating) }),
      };

      setTestimonials(prev => prev.map(t => (t.id === id ? updatedTestimonialLocal : t)).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      toast({ title: 'Depoimento atualizado' });
      return updatedTestimonialLocal;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar depoimento', description: (error as Error).message });
      return null;
    }
  };

  const removeTestimonial = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Não autenticado'});
      return false;
    }
    try {
      const testimonialDocRef = doc(db, 'users', user.uid, 'testimonials', id);
      await deleteDoc(testimonialDocRef);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Depoimento removido' });
      return true;
    } catch (error) {
      console.error('Error removing testimonial:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover depoimento', description: (error as Error).message });
      return false;
    }
  };

  return {
    testimonials,
    loadingTestimonials: loading,
    loadTestimonials, // Expose if manual refresh is needed elsewhere
    createTestimonial,
    updateTestimonial,
    removeTestimonial,
  };
}
