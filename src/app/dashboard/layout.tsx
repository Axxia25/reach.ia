"use client"

import Sidebar from "@/components/Sidebar"
import { useLeads } from "@/hooks/useLeads"
import { createSupabaseClient } from "@/lib/supabase"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseClient()

  const { vendorSummary } = useLeads(7)

  // Verificar se a rota é de vendedor
  const isVendorRoute = pathname?.startsWith("/dashboard/vendedor/")

  // Verificar autenticação e buscar perfil
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/")
        return
      }

      setUser(session.user)

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("vendedor_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
      } else {
        setUserProfile(profile)
      }
    }

    checkAuthAndProfile()

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!session) {
        router.push("/")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Se for rota de vendedor, não mostrar sidebar
  if (isVendorRoute) {
    return <>{children}</>
  }

  // Para todas as outras rotas do dashboard, mostrar sidebar fixa
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fixa */}
      <Sidebar
        user={user}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        vendedores={vendorSummary}
      />

      {/* Main Content com margem para compensar sidebar fixa */}
      <main className="flex-1 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
