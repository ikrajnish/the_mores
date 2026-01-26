import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Define guarded paths
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPath = pathname.startsWith('/login');
  const isUserPath = pathname.startsWith('/profile') || pathname.startsWith('/my-bookings');
  
  // 2. Get Token
  const token = request.cookies.get('session')?.value;
  let user = null;

  if (token) {
    user = await verifyJWT(token);
  }

  // 3. Logic
  // B. Logic
  // A. Protect Admin Routes
  if (isAdminPath) {
    if (!user) {
      console.log("Middleware: No user found for admin path, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log("Middleware: Checking Admin Role. User:", JSON.stringify(user));
    
    if (user.role !== 'ADMIN') {
      console.log("Middleware: User is not ADMIN (role=" + user.role + "), redirecting to home");
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // B. Protect User Routes
  if (isUserPath) {
     if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
     }
  }

  // B. Redirect Logged-in users from Login page
  if (isLoginPath && user) {
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // C. Enforce Phone Number
  const isCompleteProfile = pathname.startsWith('/complete-profile') || pathname.startsWith('/api/user/complete-profile');
  
  if (user && user.role !== 'ADMIN' && !user.phone && !isCompleteProfile) {
    // Prevent redirect loop if already there
    return NextResponse.redirect(new URL('/complete-profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
