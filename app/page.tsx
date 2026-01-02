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
    // Inicializa Tema
    const temaSalvo = localStorage.getItem('gsa-theme') || 'dark'
    setTema(temaSalvo)
    document.documentElement.setAttribute('data-theme', temaSalvo)

    async function carregarDados() {
      try {
        const hoje = new Date().toISOString().split('T')[0]
        
        // Faturamento do Dia
        const { data: v } = await supabase.from('vendas').select('total_venda').gte('data_venda', `${hoje}T00:00:00`)
        const faturamentoTotal = v?.reduce((acc, curr) => acc + Number(curr.total_venda), 0) || 0

        // Total de Itens (Produtos + Serviços)
        const { count: totalP } = await supabase.from('produtos').select('*', { count: 'exact', head: true })

        // Estoque Crítico
        const { count: totalC } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lte('estoque_atual', 5)

        setStats({
          faturamento: faturamentoTotal,
          produtos: totalP || 0,
          critico: totalC || 0
        })
      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error)
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
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="text-blue-500 font-black italic text-2xl animate-pulse uppercase tracking-tighter">GSA GESTÃO</div>
        <div className="text-gray-600 text-[10px] mt-2 font-bold uppercase tracking-widest">Sincronizando Banco de Dados...</div>
      </div>
    )
  }

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${tema === 'dark' ? 'bg-[#050505] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* HEADER PRINCIPAL */}
      <header className={`flex justify-between items-center mb-10 p-6 rounded-[2.5rem] border shadow-2xl transition-all ${tema === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-blue-500">GSA GESTÃO</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Dashboard Administrativo</p>
        </div>
        
        <div className="flex items-center gap-5">
          <button 
            onClick={toggleTema} 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 active:scale-95 transition-all"
          >
            {tema === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="text-right hidden md:block">
            <p className="font-black text-[9px] uppercase opacity-40 italic">Logado como</p>
            <p className="font-bold text-xs uppercase tracking-tight">{user?.email?.split('@')[0]}</p>
          </div>
        </div>
      </header>

      {/* GRID DE KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card Faturamento */}
        <div className={`p-10 rounded-[3rem] border shadow-xl transition-all ${tema === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-white border-gray-200'}`}>
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest italic">Faturamento Hoje</p>
          <div className="flex items-baseline gap-2">
             <span className="text-5xl font-black tracking-tighter text-green-500">R$ {stats.faturamento.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Card Produtos */}
        <div className={`p-10 rounded-[3rem] border shadow-xl transition-all ${tema === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-white border-gray-200'}`}>
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest italic">Produtos / Serviços</p>
          <div className="flex items-baseline gap-2">
             <span className="text-5xl font-black tracking-tighter text-blue-500">{stats.produtos}</span>
             <span className="text-lg font-black opacity-30 uppercase">Itens</span>
          </div>
        </div>

        {/* Card Alertas */}
        <div className={`p-10 rounded-[3rem] border shadow-xl transition-all ${tema === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-white border-gray-200'}`}>
          <p className="opacity-40 text-[10px] font-black uppercase mb-4 tracking-widest italic">Estoque Crítico</p>
          <div className="flex items-baseline gap-2">
             <span className="text-5xl font-black tracking-tighter text-orange-500">{stats.critico}</span>
             <span className="text-lg font-black opacity-30 uppercase">Alertas</span>
          </div>
        </div>
      </div>

      {/* GRID DE MÓDULOS (BOTÕES) */}
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em] italic">Módulos de Gestão</h3>
        <div className={`flex-1 h-[1px] ${tema === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota}>
            <div className="group cursor-pointer flex flex-col items-center">
              <div className={`${m.cor} w-full h-32 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-2xl group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300 text-white`}>
                {m.icon}
              </div>
              <p className="text-center font-black text-[10px] uppercase tracking-tighter opacity-70 group-hover:text-blue-500 transition-colors">
                {m.nome}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* FOOTER INFORMATIVO */}
      <footer className="mt-20 py-10 border-t border-gray-800/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] opacity-20 italic">Gomes Serviços Ágeis © 2026</p>
        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
             <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Database Online</span>
           </div>
           <div className="text-[9px] font-black uppercase tracking-widest opacity-20">v1.2.4-stable</div>
        </div>
      </footer>
    </main>
  )
}