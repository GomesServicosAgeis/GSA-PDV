'use client'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Bloqueado() {
  const { perfil, user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-24 h-24 bg-red-600/20 rounded-[2.5rem] border border-red-500/30 flex items-center justify-center text-5xl mb-8 shadow-2xl shadow-red-500/10">
        🔒
      </div>
      
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-black italic uppercase text-red-500 tracking-tighter">Acesso Suspenso</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
          Olá, <span className="text-white">{perfil?.empresa_nome || 'Lojista'}</span>. 
          Identificamos que sua assinatura do <span className="text-blue-500">GSA GESTÃO</span> expirou ou ainda não foi ativada.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-4 w-full max-w-xs">
        {/* Botão que leva ao WhatsApp da GSA para renovação */}
        <a 
          href="https://wa.me/55SEUNUMERO" 
          target="_blank"
          className="bg-green-600 text-white p-4 rounded-2xl font-black uppercase text-xs text-center hover:bg-green-700 transition-all shadow-lg active:scale-95"
        >
          Falar com Suporte GSA
        </a>

        <button 
          onClick={handleLogout}
          className="bg-gray-900 text-gray-500 p-4 rounded-2xl font-black uppercase text-xs border border-gray-800 hover:text-white transition-all"
        >
          Sair da Conta
        </button>
      </div>
      
      <div className="absolute bottom-10 opacity-20 text-[8px] font-black uppercase tracking-[1em]">
        Gomes Serviços Ágeis © 2026
      </div>
    </main>
  )
}