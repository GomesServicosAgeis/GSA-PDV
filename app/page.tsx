'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { perfil, user } = useAuth()
  const [stats, setStats] = useState({ vendasDia: 0, totalProdutos: 0, estoqueBaixo: 0 })

  useEffect(() => {
    async function carregarKpis() {
      const hoje = new Date().toISOString().split('T')[0]
      const { data: v } = await supabase.from('vendas').select('total_venda').gte('data_venda', `${hoje}T00:00:00`)
      const { count: p } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
      const { count: eb } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lt('estoque_atual', 5)
      
      const totalDia = v?.reduce((acc, curr) => acc + Number(curr.total_venda), 0) || 0
      setStats({ vendasDia: totalDia, totalProdutos: p || 0, estoqueBaixo: eb || 0 })
    }
    carregarKpis()
  }, [])

  // Mapeamento de botões - O segredo está na rota do botão ESTOQUE
  const modulos = [
    { nome: 'Vendas (PDV)', rota: '/pdv', icon: '🛒', cor: 'bg-blue-600' },
    { nome: 'Estoque', rota: '/cadastro', icon: '📦', cor: 'bg-orange-600' }, // <--- DIRECIONA PARA O CADASTRO
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: 'bg-emerald-600' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: 'bg-purple-600' },
    { nome: 'Financeiro', rota: '/financeiro', icon: '💰', cor: 'bg-red-600' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: 'bg-gray-700' },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black italic text-blue-500 uppercase tracking-tighter">GSA GESTÃO</h1>
        <div className="text-right uppercase font-black text-[10px] text-gray-500">
          <p>Lojista: {user?.email}</p>
        </div>
      </header>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Vendas Hoje</p>
          <h2 className="text-4xl font-black text-white">R$ {stats.vendasDia.toFixed(2)}</h2>
        </div>
        <div className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800 text-center">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Produtos</p>
          <h2 className="text-4xl font-black text-white">{stats.totalProdutos}</h2>
        </div>
        <div className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800 text-right">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Alertas</p>
          <h2 className="text-4xl font-black text-orange-500">{stats.estoqueBaixo}</h2>
        </div>
      </div>

      {/* Menu de Botões */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota}>
            <div className="group cursor-pointer">
              <div className={`${m.cor} h-24 rounded-3xl flex items-center justify-center text-3xl mb-2 hover:scale-105 transition-all shadow-xl active:scale-95`}>
                {m.icon}
              </div>
              <p className="text-center font-black text-[9px] uppercase tracking-widest">{m.nome}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}