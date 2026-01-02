'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password: password 
    })

    if (error) {
      setErro(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
      setLoading(false)
    } else {
      // ALTERAÇÃO AQUI: Manda para a Home (Dashboard) e não para o PDV
      router.push('/')
    }
  }

  return (
    <main className="h-screen flex items-center justify-center bg-gray-950 font-sans p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 md:p-10 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md text-white">
        <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter mb-2 text-center uppercase">GSA GESTÃO</h1>
        <p className="text-gray-500 text-center mb-8 font-bold text-[10px] uppercase tracking-widest italic">Acesse seu Painel</p>
        
        {erro && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-[10px] font-black mb-6 text-center uppercase">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <input 
            type="email" placeholder="E-MAIL" 
            className="w-full p-4 rounded-xl bg-gray-800 text-white outline-none border border-transparent focus:border-blue-500 font-bold" 
            onChange={e => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="SENHA" 
            className="w-full p-4 rounded-xl bg-gray-800 text-white outline-none border border-transparent focus:border-blue-500 font-bold" 
            onChange={e => setPassword(e.target.value)} required 
          />
          <button 
            disabled={loading} 
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
          
          <div className="text-center mt-6">
            <Link href="/registrar" className="text-gray-500 hover:text-white text-[10px] font-black uppercase transition-colors tracking-widest">
              Não tem conta? Registre-se aqui
            </Link>
          </div>
        </div>
      </form>
    </main>
  )
}