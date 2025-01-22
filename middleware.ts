import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPath = request.nextUrl.pathname === '/admin/login';
  const isRootAdminPath = request.nextUrl.pathname === '/admin';
  const adminAuth = request.cookies.get('adminAuthenticated');

  if (isAdminPath) {
    // If trying to access admin pages without auth (except login page)
    if (!adminAuth?.value && !isLoginPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If trying to access login page while already authenticated
    if (adminAuth?.value && isLoginPath) {
      return NextResponse.redirect(new URL('/admin/products', request.url));
    }

    // If accessing root admin path while authenticated
    if (adminAuth?.value && isRootAdminPath) {
      return NextResponse.redirect(new URL('/admin/products', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 