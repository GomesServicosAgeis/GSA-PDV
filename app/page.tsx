'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()
  const [tema, setTema] = useState('dark')
  const [stats, setStats] = useState({ faturamento: 0, produtos: 0, critico: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Inicializa Tema
    const temaSalvo = localStorage.getItem('gsa-theme') || 'dark'
    setTema(temaSalvo)
    document.documentElement.setAttribute('data-theme', temaSalvo)

    // 2. Busca Dados Reais do Supabase
    async function carregarDados() {
      try {
        const hoje = new Date().toISOString().split('T')[0]
        
        // Faturamento
        const { data: v } = await supabase.from('vendas').select('total_venda').gte('data_venda', `${hoje}T00:00:00`)
        const faturamentoTotal = v?.reduce((acc, curr) => acc + Number(curr.total_venda), 0) || 0

        // Total Produtos
        const { count: totalP } = await supabase.from('produtos').select('*', { count: 'exact', head: true })

        // Estoque Crítico
        const { count: totalC } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lte('estoque_atual', 5)

        setStats({
          faturamento: faturamentoTotal,
          produtos: totalP || 0,
          critico: totalC || 0
        })
      } catch (error) {
        console.error("Erro ao carregar KPIs:", error)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [])

  const toggleTema = () => {
    const novoTema = tema === 'dark' ? 'light' : 'dark'
    setTema(novoTema)
    localStorage.setItem('gsa-theme', novoTema)
    document.documentElement.setAttribute('data-theme', novoTema)
  }

  const modulos = [
    { nome: 'Vendas (PDV)', rota: '/pdv', icon: '🛒', cor: 'bg-blue-600' },
    { nome: 'Estoque', rota: '/cadastro', icon: '📦', cor: 'bg-orange-600' },
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: 'bg-emerald-600' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: 'bg-purple-600' },
    { nome: 'Financeiro', rota: '/financeiro', icon: '💰', cor: 'bg-red-600' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: 'bg-gray-500' },
  ]

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-blue-500 font-black italic animate-pulse">CARREGANDO GSA...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 p-6 rounded-[2.5rem] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-xl transition-all">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-blue-500">GSA GESTÃO</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Dashboard Administrativo</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTema} 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 active:scale-90 transition-all shadow-inner"
          >
            {tema === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="text-right hidden md:block">
            <p className="font-black text-[9px] uppercase opacity-40 italic">Dono da Conta</p>
            <p className="font-bold text-xs uppercase">{user?.email?.split('@')[0]}</p>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-10 rounded-[3rem] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg hover:scale-[1.02] transition-transform">
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest">Faturamento Hoje</p>
          <h2 className="text-5xl font-black tracking-tighter text-green-500">R$ {stats.faturamento.toFixed(2)}</h2>
        </div>
        
        <div className="p-10 rounded-[3rem] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg hover:scale-[1.02] transition-transform">
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest">Produtos / Serviços</p>
          <h2 className="text-5xl font-black tracking-tighter text-blue-500">{stats.produtos} <span className="text-lg">ITENS</span></h2>
        </div>

        <div className="p-10 rounded-[3rem] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg hover:scale-[1.02] transition-transform">
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest">Estoque Crítico</p>
          <h2 className="text-5xl font-black tracking-tighter text-orange-500">{stats.critico} <span className="text-lg">ALERTAS</span></h2>
        </div>
      </div>

      {/* MÓDULOS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota}>
            <div className="group cursor-pointer flex flex-col items-center">
              <div className={`${m.cor} w-full h-32 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 text-white`}>
                {m.icon}
              </div>
              <p className="text-center font-black text-[10px] uppercase tracking-tighter opacity-80 group-hover:text-blue-500 transition-colors">
                {m.nome}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="mt-20 py-8 border-t border-[rgb(var(--border))] flex justify-between items-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">Gomes Serviços Ágeis © 2026</p>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-black uppercase">Sistema Online</span>
        </div>
      </footer>
    </main>
  )
}