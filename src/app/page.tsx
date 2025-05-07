
import { redirect } from 'next/navigation';

export default function HomePage() {
  // In a real app, you might check authentication status here
  // For now, we'll just redirect to the dashboard
  redirect('/dashboard');
}
