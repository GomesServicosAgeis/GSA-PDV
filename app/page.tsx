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
      
      // 1. Soma de Vendas do Dia
      const { data: v } = await supabase.from('vendas')
        .select('total_venda')
        .gte('data_venda', `${hoje}T00:00:00`)

      // 2. Contagem de Produtos
      const { count: p } = await supabase.from('produtos').select('*', { count: 'exact', head: true })

      // 3. Alerta de Estoque Baixo (< 5 unidades)
      const { count: eb } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lt('estoque_atual', 5)

      const totalDia = v?.reduce((acc, curr) => acc + Number(curr.total_venda), 0) || 0

      setStats({
        vendasDia: totalDia,
        totalProdutos: p || 0,
        estoqueBaixo: eb || 0
      })
      setLoading(false)
    }
    carregarKpis()
  }, [])

  const botoesMenu = [
    { nome: 'PDV (Vendas)', rota: '/pdv', icon: '🛒', cor: 'bg-blue-600' },
    { nome: 'Estoque', rota: '/cadastro', icon: '📦', cor: 'bg-orange-600' },
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: 'bg-emerald-600' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: 'bg-purple-600' },
    { nome: 'Boletos/Financeiro', rota: '/financeiro', icon: '💰', cor: 'bg-red-600' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: 'bg-gray-700' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black italic text-blue-500 tracking-tighter uppercase">GSA GESTÃO</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Dashboard Administrativo</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-500 uppercase italic">Bem-vindo, {perfil?.empresa_nome || 'GSA'}</p>
          <p className="font-bold text-xs text-blue-400">{user?.email}</p>
        </div>
      </header>

      {/* KPIs Dinâmicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Vendas Hoje</p>
          <h2 className="text-4xl font-black text-green-500 tracking-tighter">R$ {stats.vendasDia.toFixed(2)}</h2>
        </div>
        <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Mix de Produtos</p>
          <h2 className="text-4xl font-black text-blue-500 tracking-tighter">{stats.totalProdutos} Itens</h2>
        </div>
        <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-orange-900/20 shadow-2xl">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Estoque Crítico</p>
          <h2 className="text-4xl font-black text-orange-500 tracking-tighter">{stats.estoqueBaixo} Alertas</h2>
        </div>
      </div>

      {/* Menu de Navegação */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-[0.3em] ml-2 italic">Acesso Rápido</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {botoesMenu.map((btn) => (
          <Link key={btn.nome} href={btn.rota}>
            <div className={`${btn.cor} p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:scale-105 transition-all cursor-pointer shadow-xl active:scale-95 h-36 text-center group`}>
              <span className="text-4xl group-hover:rotate-12 transition-transform">{btn.icon}</span>
              <span className="text-[10px] font-black uppercase leading-tight tracking-tighter">{btn.nome}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer / Status */}
      <div className="mt-12 pt-6 border-t border-gray-900 flex justify-between text-[9px] font-black text-gray-700 uppercase tracking-widest">
        <span>Gomes Serviços Ágeis © 2026</span>
        <span>Sistema Operacional via Vercel</span>
      </div>
    </main>
  )
}