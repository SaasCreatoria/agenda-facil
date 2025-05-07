
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Add paths that should be protected
const protectedPaths = [
  '/dashboard',
  '/agendamentos',
  '/clientes',
  '/profissionais',
  '/servicos',
  '/lembretes',
  '/configuracao',
];

// Add paths that are only for unauthenticated users (e.g., login, signup)
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); // Example cookie name

  // If user is trying to access a protected path without being authenticated
  if (protectedPaths.some(path => pathname.startsWith(path)) && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname); // Optional: redirect back after login
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access login/signup pages
  if (authRoutes.includes(pathname) && currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard'; // Redirect to dashboard
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g., images, svgs, etc. in /public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
