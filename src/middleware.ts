import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Add paths that should be protected (require authentication)
// const protectedPaths = [
//   '/dashboard',
//   '/agendamentos',
//   '/clientes',
//   '/profissionais',
//   '/servicos',
//   '/lembretes',
//   '/configuracao',
//   '/onboarding', 
// ];

// Add paths that are only for unauthenticated users (e.g., login, signup)
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); 

  // If user is trying to access a protected path without being authenticated
  // This block is removed/commented out because client-side AuthenticatedAppLayout handles this.
  // The cookie 'firebaseAuthToken' is likely not being set by client-side Firebase auth,
  // causing this middleware to incorrectly block authenticated users.
  /*
  if (protectedPaths.some(path => pathname.startsWith(path)) && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname); 
    return NextResponse.redirect(url);
  }
  */

  // If user is authenticated (cookie exists) and tries to access login/signup pages
  // This part is kept. If the cookie mechanism is ever implemented, it will work.
  // If cookie is not set, this block will not execute, which is fine.
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
