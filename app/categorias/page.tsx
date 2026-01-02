'use client'
import Link from 'next/link'

export default function EmDesenvolvimento() {
  return (
    <main className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse">🛠️</div>
      <h1 className="text-2xl font-black italic uppercase text-blue-500 mb-2">Módulo em Desenvolvimento</h1>
      <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-8">Gomes Serviços Ágeis - GSA</p>
      <Link href="/" className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-gray-200 transition-all">
        Voltar ao Dashboard
      </Link>
    </main>
  )
}