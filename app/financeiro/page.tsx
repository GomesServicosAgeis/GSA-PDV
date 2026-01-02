'use client'
import Link from 'next/link'

export default function Financeiro() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="text-center">
        <span className="text-6xl mb-6 block">💰</span>
        <h1 className="text-4xl font-black italic text-red-500 mb-4 uppercase">Módulo Financeiro</h1>
        <p className="text-gray-500 font-bold max-w-md mx-auto mb-8">
          Em breve: Gestão de Boletos, Contas a Pagar/Receber e Fluxo de Caixa integrado.
        </p>
        <Link href="/" className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase hover:bg-gray-200 transition-all">
          Voltar ao Dashboard
        </Link>
      </div>
    </main>
  )
}