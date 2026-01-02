'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter, usePathname } from 'next/navigation'

const AuthContext = createContext<any>({})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const ADMIN_EMAIL = 'gomesservicosageis@gmail.com'

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user || null
      setUser(currentUser)

      if (currentUser) {
        // Se está logado, busca o perfil para checar a trava
        const { data: perfilData } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        setPerfil(perfilData)

        const hoje = new Date()
        const expiracao = perfilData?.data_expiracao ? new Date(perfilData.data_expiracao) : null
        const isExpired = expiracao && expiracao < hoje
        const isAdmin = currentUser.email === ADMIN_EMAIL

        // Trava de mensalidade: se expirou e não é ADM, bloqueia
        if (!isAdmin && isExpired && pathname !== '/bloqueado') {
          router.push('/bloqueado')
        }
      } else {
        // Se NÃO está logado, só pode ver as rotas públicas abaixo
        const rotasPublicas = ['/login', '/registrar', '/cadastro-usuario', '/bloqueado']
        
        if (!rotasPublicas.includes(pathname)) {
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkUser()

    // Listener para mudanças de estado (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ user, perfil, loading }}>
      {!loading ? (
        children
      ) : (
        <div className="h-screen bg-gray-950 flex items-center justify-center text-blue-500 font-black italic animate-pulse">
          CARREGANDO GSA PDV...
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)