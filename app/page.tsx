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
      
      // 1. Vendas do Dia
      const { data: v } = await supabase.from('vendas')
        .select('total_venda')
        .gte('data_venda', `${hoje}T00:00:00`)

      // 2. Total de Produtos
      const { count: p } = await supabase.from('produtos').select('*', { count: 'exact', head: true })

      // 3. Alerta de Estoque Baixo (Ex: < 5 unidades)
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
      {/* Header Profissional */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black italic text-blue-500 tracking-tighter uppercase">GSA GESTÃO</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Painel de Controle de {perfil?.empresa_nome || 'Lojista'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-500 uppercase">Usuário Logado</p>
          <p className="font-bold text-sm text-blue-400">{user?.email}</p>
        </div>
      </header>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
          <p className="text-gray-500 text-xs font-black uppercase mb-2">Vendas Hoje</p>
          <h2 className="text-4xl font-black text-green-500">R$ {stats.vendasDia.toFixed(2)}</h2>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
          <p className="text-gray-500 text-xs font-black uppercase mb-2">Produtos Ativos</p>
          <h2 className="text-4xl font-black text-blue-500">{stats.totalProdutos}</h2>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl border border-red-900/30 shadow-xl">
          <p className="text-gray-500 text-xs font-black uppercase mb-2">Alertas de Estoque</p>
          <h2 className="text-4xl font-black text-orange-500">{stats.estoqueBaixo}</h2>
        </div>
      </div>

      {/* Grid de Ferramentas (Menu Principal) */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Utilidades do Sistema</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {botoesMenu.map((btn) => (
          <Link key={btn.nome} href={btn.rota}>
            <div className={`${btn.cor} p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:scale-105 transition-all cursor-pointer shadow-lg active:scale-95 h-32 text-center`}>
              <span className="text-3xl">{btn.icon}</span>
              <span className="text-[10px] font-black uppercase leading-tight">{btn.nome}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Espaço para Gráfico Futuro */}
      <div className="mt-10 bg-gray-900/50 border border-gray-800 p-10 rounded-[3rem] text-center">
        <p className="text-gray-600 font-bold uppercase text-xs">Área destinada a gráficos de desempenho mensal (Chart.js)</p>
      </div>
    </main>
  )
}