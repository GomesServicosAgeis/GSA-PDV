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

  // Seu e-mail de administrador com acesso ilimitado
  const ADMIN_EMAIL = 'gomesservicosageis@gmail.com'

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user || null
      setUser(currentUser)

      if (currentUser) {
        // Busca os dados do perfil no banco de dados
        const { data: perfilData } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        setPerfil(perfilData)

        // Lógica da trava SaaS
        const hoje = new Date()
        const expiracao = perfilData?.data_expiracao ? new Date(perfilData.data_expiracao) : null
        const isExpired = expiracao && expiracao < hoje
        const isAdmin = currentUser.email === ADMIN_EMAIL

        // 1. Se o lojista expirou e não é você (ADM), bloqueia o acesso
        if (!isAdmin && isExpired && pathname !== '/bloqueado') {
          router.push('/bloqueado')
          setLoading(false)
          return
        }

        // 2. Se ele estiver logado e tentar acessar login ou registrar, manda para o Dashboard (/)
        if (pathname === '/login' || pathname === '/registrar') {
          router.push('/')
        }

      } else {
        // 3. Se NÃO está logado, só permite rotas públicas
        const rotasPublicas = ['/login', '/registrar', '/cadastro-usuario', '/bloqueado']
        
        if (!rotasPublicas.includes(pathname)) {
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkUser()

    // Listener para mudanças de autenticação em tempo real
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user || null
      setUser(newUser)
      
      if (event === 'SIGNED_IN') {
        router.push('/') // Garante que ao logar ele vá para o Dashboard
      }
      
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
        <div className="h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
          <div className="text-blue-500 font-black italic animate-pulse text-2xl uppercase tracking-tighter">
            GSA GESTÃO
          </div>
          <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-[loading_2s_infinite]"></div>
          </div>
          <style jsx>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)