'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Registrar() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: window.location.origin, // Redireciona de volta para seu site na Vercel
        }
      })

      if (error) {
        // Se o erro for "Email logins are disabled", precisamos ajustar o Supabase
        if (error.message.includes("Email logins are disabled")) {
          setErro("ERRO TÉCNICO: O provedor de e-mail está desativado no painel do Supabase. Ative-o em Auth > Providers > Email.")
        } else {
          setErro(error.message)
        }
      } else if (data.user) {
        alert('Conta criada com sucesso! Verifique se o login já está liberado.')
        router.push('/login')
      }
    } catch (err: any) {
      setErro("Falha na conexão com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen flex items-center justify-center bg-gray-950 font-sans p-4">
      <form onSubmit={handleRegister} className="bg-gray-900 p-8 md:p-10 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter mb-2 text-center uppercase">GSA PDV</h1>
        <p className="text-gray-500 text-center mb-8 font-bold text-[10px] uppercase tracking-widest italic">Novo Cadastro de Lojista</p>
        
        {erro && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-[10px] font-black mb-6 text-center uppercase tracking-tighter">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">E-mail Profissional</label>
            <input 
              type="email" 
              placeholder="exemplo@gmail.com" 
              className="w-full p-4 rounded-xl bg-gray-800 text-white outline-none border border-transparent focus:border-blue-500 font-bold text-sm"
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Senha de Acesso</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 rounded-xl bg-gray-800 text-white outline-none border border-transparent focus:border-blue-500 font-bold text-sm"
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'PROCESSANDO...' : 'REGISTRAR AGORA'}
          </button>
          
          <div className="text-center mt-6">
            <Link href="/login" className="text-gray-500 hover:text-white text-[10px] font-black uppercase transition-colors tracking-widest">
              Já possui uma conta? Entrar
            </Link>
          </div>
        </div>
      </form>
    </main>
  )
}