/* eslint-disable */
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

import { resolveTenantContext } from '@/lib/tenant'

const protectedRoutes = ['/home', '/inbox', '/leads', '/pipeline', '/billing', '/settings']

const isProtectedRoute = (pathname: string) =>
  protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

const isLoginRoute = (pathname: string) => pathname === '/login' || pathname.startsWith('/login/')

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const tenant = resolveTenantContext(req.headers.get('host'))
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${req.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginRoute(pathname) && token) {
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
    const safeCallbackUrl = callbackUrl?.startsWith('/') ? callbackUrl : '/home'
    return NextResponse.redirect(new URL(safeCallbackUrl, req.url))
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-magnus-host', tenant.host)
  requestHeaders.set('x-magnus-is-platform-host', tenant.isPlatformHost ? 'true' : 'false')

  if (tenant.tenantSlug) {
    requestHeaders.set('x-magnus-tenant-slug', tenant.tenantSlug)
  }

  if (token?.sub) {
    requestHeaders.set('x-magnus-user-id', token.sub)
  }

  if (token?.role) {
    requestHeaders.set('x-magnus-user-role', String(token.role))
  }

  requestHeaders.set('x-magnus-authenticated', token ? 'true' : 'false')

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|images|assets).*)']
}
