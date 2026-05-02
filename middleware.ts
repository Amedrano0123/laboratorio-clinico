import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/pacientes',
  '/auditoria',
  '/admin',
  '/results',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const userCookie = req.cookies.get('lab_user')

  if (isProtected && !userCookie) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/' && !userCookie) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/' && userCookie) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/orders/:path*',
    '/pacientes/:path*',
    '/auditoria/:path*',
    '/admin/:path*',
    '/results/:path*',
  ],
}