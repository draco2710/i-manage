import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that don't satisfy the matcher should be excluded automatically, 
    // but we can add extra checks here if needed.
    // The matcher in config handles most cases.

    // If user has token and tries to access login, redirect to root
    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If user has no token and tries to access protected route (everything else)
    if (!token && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
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
         * - register (registration page - if exists)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|register).*)',
    ],
};
