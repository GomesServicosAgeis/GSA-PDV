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
        // Busca perfil
        const { data: perfilData } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        setPerfil(perfilData)

        // Lógica de Bloqueio SaaS
        const hoje = new Date()
        const expiracao = perfilData?.data_expiracao ? new Date(perfilData.data_expiracao) : null
        const isExpired = expiracao && expiracao < hoje
        const isAdmin = currentUser.email === ADMIN_EMAIL

        if (!isAdmin && isExpired && pathname !== '/bloqueado') {
          router.push('/bloqueado')
        }
      } else {
        // Se não está logado, só acessa rotas públicas
        const rotasPublicas = ['/login', '/registrar', '/bloqueado']
        if (!rotasPublicas.includes(pathname)) {
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [pathname]) // Removi o 'router' daqui para evitar loops de refresh

  return (
    <AuthContext.Provider value={{ user, perfil, loading }}>
      {!loading ? children : (
        <div className="h-screen bg-[#050505] flex items-center justify-center text-blue-500 font-black italic animate-pulse uppercase tracking-tighter">
          GSA GESTÃO...
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)