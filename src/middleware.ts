import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Add paths that should be protected (require authentication)
const protectedPaths = [
  '/dashboard',
  '/agendamentos',
  '/clientes',
  '/profissionais',
  '/servicos',
  '/lembretes',
  '/configuracao',
  '/onboarding', // Add onboarding to protected paths
];

// Add paths that are only for unauthenticated users (e.g., login, signup)
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Assuming your Firebase auth token is stored in a cookie named 'firebaseAuthToken'
  // Adjust the cookie name if it's different.
  // Note: This is a basic check. For more robust auth, consider Firebase Admin SDK on backend 
  // or more secure token verification if calling Firebase from middleware directly.
  // For client-side rendered apps, onAuthStateChanged in AuthProvider is the primary gatekeeper.
  // This middleware primarily handles initial server-side redirects for unauthenticated users.
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); 

  // If user is trying to access a protected path without being authenticated
  if (protectedPaths.some(path => pathname.startsWith(path)) && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname); 
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access login/signup pages
  // The actual redirection based on onboarding status will be handled in the AuthenticatedAppLayout
  // This middleware ensures they don't see login/signup if already logged in.
  if (authRoutes.includes(pathname) && currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard'; // Default redirect for authenticated users on auth routes
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
