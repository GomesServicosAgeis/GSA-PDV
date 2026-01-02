'use client'
import Link from 'next/link'

export default function EmDesenvolvimento() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 flex items-center justify-center text-5xl mb-8 animate-pulse">
        🚧
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black italic uppercase text-blue-500 tracking-tighter">Módulo em Ajuste</h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-10">Gomes Serviços Ágeis - GSA</p>
      </div>

      <Link href="/" className="mt-8 group">
        <div className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl active:scale-95">
          Voltar ao Dashboard
        </div>
      </Link>
      
      <div className="absolute bottom-10 opacity-20 text-[8px] font-black uppercase tracking-[1em]">
        System Status: Stable
      </div>
    </main>
  )
}