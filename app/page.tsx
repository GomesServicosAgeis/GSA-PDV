'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { perfil, user } = useAuth()
  const [stats, setStats] = useState({ vendasDia: 0, totalProdutos: 0, estoqueBaixo: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarKpis() {
      const hoje = new Date().toISOString().split('T')[0]
      
      try {
        // 1. Vendas do Dia
        const { data: v } = await supabase.from('vendas')
          .select('total_venda')
          .gte('data_venda', `${hoje}T00:00:00`)

        // 2. Total de Produtos
        const { count: p } = await supabase.from('produtos').select('*', { count: 'exact', head: true })

        // 3. Estoque Crítico
        const { count: eb } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lt('estoque_atual', 5)

        const totalDia = v?.reduce((acc, curr) => acc + Number(curr.total_venda), 0) || 0

        setStats({
          vendasDia: totalDia,
          totalProdutos: p || 0,
          estoqueBaixo: eb || 0
        })
      } catch (error) {
        console.error("Erro ao carregar KPIs")
      } finally {
        setLoading(false)
      }
    }
    carregarKpis()
  }, [])

  const modulos = [
    { nome: 'Vendas (PDV)', rota: '/pdv', icon: '🛒', cor: 'bg-blue-600', desc: 'Frente de caixa' },
    { nome: 'Estoque', rota: '/cadastro', icon: '📦', cor: 'bg-orange-600', desc: 'Produtos e Inventário' },
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: 'bg-emerald-600', desc: 'Base de compradores' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: 'bg-purple-600', desc: 'Gestão de compras' },
    { nome: 'Financeiro', rota: '/financeiro', icon: '💰', cor: 'bg-red-600', desc: 'Boletos e Caixa' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: 'bg-gray-700', desc: 'Análise de dados' },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      {/* HEADER GSA */}
      <header className="flex justify-between items-center mb-12 bg-gray-900/40 p-6 rounded-[2rem] border border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-lg shadow-blue-500/20">G</div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">GSA GESTÃO</h1>
            <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">Gomes Serviços Ágeis</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-gray-500 uppercase italic">Acesso Master</p>
          <p className="font-bold text-xs text-white uppercase">{user?.email}</p>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-800 hover:border-green-500/30 transition-all group">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-4 tracking-widest">Faturamento Hoje</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter tabular-nums">R$ {stats.vendasDia.toFixed(2)}</span>
            <span className="text-green-500 text-xs font-bold mb-1">↑ 12%</span>
          </div>
        </div>

        <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-800 hover:border-blue-500/30 transition-all">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-4 tracking-widest">Produtos em Linha</p>
          <h2 className="text-4xl font-black text-white tracking-tighter">{stats.totalProdutos} <span className="text-blue-500 text-lg uppercase">SKUs</span></h2>
        </div>

        <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-800 hover:border-orange-500/30 transition-all">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-4 tracking-widest">Atenção ao Estoque</p>
          <h2 className="text-4xl font-black text-white tracking-tighter">{stats.estoqueBaixo} <span className="text-orange-500 text-lg uppercase">Reposições</span></h2>
        </div>
      </div>

      {/* NAVEGAÇÃO / RAMIFICAÇÕES */}
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic">Módulos do Sistema</h3>
        <div className="flex-1 h-[1px] bg-gray-800"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota}>
            <div className="group cursor-pointer">
              <div className={`${m.cor} h-32 rounded-[2.5rem] flex items-center justify-center text-4xl mb-3 shadow-xl group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300`}>
                {m.icon}
              </div>
              <p className="text-center font-black text-[10px] uppercase tracking-tighter group-hover:text-blue-500 transition-colors">{m.nome}</p>
              <p className="text-center text-gray-600 text-[8px] font-bold uppercase mt-1">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* STATUS BAR */}
      <footer className="mt-16 pt-8 border-t border-gray-900 flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">GSA Operating System v1.0 Beta</p>
        <div className="flex gap-4">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
           <p className="text-[9px] font-black uppercase tracking-[0.2em]">Servidor Online</p>
        </div>
      </footer>
    </main>
  )
}