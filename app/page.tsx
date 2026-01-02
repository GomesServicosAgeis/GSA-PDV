'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({ produtos: 0, critico: 0 })

  useEffect(() => {
    async function carregarDados() {
      const { count: p } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
      const { count: c } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lte('estoque_atual', 5)
      setStats({ produtos: p || 0, critico: c || 0 })
    }
    carregarDados()
  }, [])

  const modulos = [
    { nome: 'Vendas (PDV)', rota: '/pdv', icon: '🛒', cor: 'bg-blue-600' },
    { nome: 'Estoque', rota: '/cadastro', icon: '📦', cor: 'bg-orange-600' },
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: 'bg-emerald-600' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: 'bg-purple-600' },
    { nome: 'Financeiro', rota: '/financeiro', icon: '💰', cor: 'bg-red-600' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: 'bg-zinc-700' },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      
      <header className="flex justify-between items-center mb-10 p-6 rounded-[2rem] border border-zinc-800 bg-[#0f0f0f] shadow-2xl">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-blue-500">GSA GESTÃO</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Dashboard Administrativo</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-10 rounded-[3rem] border border-zinc-800 bg-[#0f0f0f] shadow-xl">
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest">Faturamento Hoje</p>
          <h2 className="text-5xl font-black text-green-500">R$ 0,00</h2>
        </div>
        <div className="p-10 rounded-[3rem] border border-zinc-800 bg-[#0f0f0f] shadow-xl">
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest">Produtos</p>
          <h2 className="text-5xl font-black text-blue-500">{stats.produtos}</h2>
        </div>
        <div className="p-10 rounded-[3rem] border border-zinc-800 bg-[#0f0f0f] shadow-xl">
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest">Alertas</p>
          <h2 className="text-5xl font-black text-orange-500">{stats.critico}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota} className="flex flex-col items-center group">
            <div className={`${m.cor} w-full h-32 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-2xl transition-transform group-hover:scale-105 text-white`}>
              {m.icon}
            </div>
            <p className="font-black text-[10px] uppercase opacity-70">{m.nome}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}