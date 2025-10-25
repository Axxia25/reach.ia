import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/dashboard']
  const adminRoutes = ['/dashboard/admin']
  const vendorRoutes = ['/dashboard/vendedor']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isVendorRoute = vendorRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Se há sessão e está acessando rota protegida, verificar role
  if (session && isProtectedRoute) {
    try {
      // Buscar perfil do usuário
      const { data: profile, error } = await supabase
        .from('vendedor_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil no middleware:', error)
        // Se não tem perfil, redirecionar para login
        const redirectUrl = new URL('/', req.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Aplicar regras de redirecionamento baseadas no role
      if (profile) {
        const userRole = profile.role
        const vendedorName = profile.vendedor_name

        // VENDEDOR: Só pode acessar próprio dashboard individual
        if (userRole === 'vendedor') {
          const allowedVendorPath = `/dashboard/vendedor/${encodeURIComponent(vendedorName)}`
          
          // Se vendedor está tentando acessar dashboard geral
          if (req.nextUrl.pathname === '/dashboard') {
            const redirectUrl = new URL(allowedVendorPath, req.url)
            return NextResponse.redirect(redirectUrl)
          }
          
          // Se vendedor está tentando acessar área admin
          if (isAdminRoute) {
            const redirectUrl = new URL(allowedVendorPath, req.url)
            return NextResponse.redirect(redirectUrl)
          }
          
          // Se vendedor está tentando acessar dashboard de outro vendedor
          if (isVendorRoute && req.nextUrl.pathname !== allowedVendorPath) {
            const redirectUrl = new URL(allowedVendorPath, req.url)
            return NextResponse.redirect(redirectUrl)
          }
        }

        // GERENTE: Pode acessar dashboard geral e individual, mas não admin
        if (userRole === 'gerente') {
          // Se gerente está tentando acessar área admin (só para admins)
          if (isAdminRoute) {
            const redirectUrl = new URL('/dashboard', req.url)
            return NextResponse.redirect(redirectUrl)
          }
        }

        // ADMIN: Pode acessar tudo (sem restrições)
      }
    } catch (error) {
      console.error('Erro no middleware:', error)
      // Em caso de erro, permitir acesso (para não quebrar o sistema)
    }
  }

  // Redirect to dashboard if accessing login page with active session
  if (req.nextUrl.pathname === '/' && session) {
    // Buscar perfil para decidir para onde redirecionar
    try {
      const { data: profile } = await supabase
        .from('vendedor_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        if (profile.role === 'vendedor') {
          // Vendedor vai direto para dashboard individual
          const redirectUrl = new URL(`/dashboard/vendedor/${encodeURIComponent(profile.vendedor_name)}`, req.url)
          return NextResponse.redirect(redirectUrl)
        } else {
          // Admin/Gerente vai para dashboard geral
          const redirectUrl = new URL('/dashboard', req.url)
          return NextResponse.redirect(redirectUrl)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil na página inicial:', error)
    }
    
    // Fallback: redirecionar para dashboard geral (comportamento original)
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}