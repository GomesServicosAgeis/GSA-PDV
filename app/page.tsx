'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()
  const [tema, setTema] = useState('dark')
  const [stats, setStats] = useState({ faturamento: 0, produtos: 0, critico: 0 })

  useEffect(() => {
    // 1. Lógica do Tema
    const temaSalvo = localStorage.getItem('gsa-theme') || 'dark'
    setTema(temaSalvo)
    document.documentElement.setAttribute('data-theme', temaSalvo)

    // 2. Lógica dos Dados (KPIs)
    async function carregarDados() {
      const hoje = new Date().toISOString().split('T')[0]
      
      // Busca Faturamento Hoje
      const { data: v } = await supabase.from('vendas').select('total_venda').gte('data_venda', `${hoje}T00:00:00`)
      const faturamentoTotal = v?.reduce((acc, curr) => acc + Number(curr.total_venda), 0) || 0

      // Busca Total de Produtos
      const { count: totalP } = await supabase.from('produtos').select('*', { count: 'exact', head: true })

      // Busca Estoque Crítico (Menor ou igual ao mínimo cadastrado ou 5)
      const { count: totalC } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).filter('estoque_atual', 'lte', 5)

      setStats({
        faturamento: faturamentoTotal,
        produtos: totalP || 0,
        critico: totalC || 0
      })
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="flex justify-between items-center mb-12 p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">GSA GESTÃO</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Dashboard Administrativo</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleTema} className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 active:scale-90 transition-all">
            {tema === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="text-right hidden md:block leading-tight">
            <p className="font-black text-[10px] uppercase opacity-40 italic">Usuário Master</p>
            <p className="font-bold text-xs">{user?.email?.split('@')[0]}</p>
          </div>
        </div>
      </header>

      {/* KPIs Restaurados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-8 rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)]">
          <p className="opacity-40 text-[10px] font-black uppercase mb-2 tracking-widest">Faturamento Hoje</p>
          <h2 className="text-4xl font-black tracking-tighter text-green-500">R$ {stats.faturamento.toFixed(2)}</h2>
        </div>
        <div className="p-8 rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)]">
          <p className="opacity-40 text-[10px] font-black uppercase mb-2 tracking-widest">Produtos em Linha</p>
          <h2 className="text-4xl font-black tracking-tighter text-blue-500">{stats.produtos} Itens</h2>
        </div>
        <div className="p-8 rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)]">
          <p className="opacity-40 text-[10px] font-black uppercase mb-2 tracking-widest">Estoque Crítico</p>
          <h2 className="text-4xl font-black tracking-tighter text-orange-500">{stats.critico} Alertas</h2>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota}>
            <div className="group cursor-pointer">
              <div className={`${m.cor} h-24 rounded-[2rem] flex items-center justify-center text-3xl mb-3 shadow-xl group-hover:scale-105 transition-all`}>
                {m.icon}
              </div>
              <p className="text-center font-black text-[9px] uppercase tracking-tighter opacity-80">{m.nome}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}