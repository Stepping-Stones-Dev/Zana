import { NextRequest, NextResponse } from 'next/server';

// Simple auth guard: looks for a session indicator cookie (customize later)
// We can't rely on Firebase client state here, so use a server cookie set after SAML callback.
const PUBLIC_PATHS = [
  '/saml-login',
  '/api/auth/saml/login',
  '/api/auth/saml/callback'
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get('sam_session');
  if (!sessionCookie) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/saml-login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\.).*)'] // all paths without a file extension
};
