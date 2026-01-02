'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()
  const [tema, setTema] = useState('dark') // Padrão GSA

  // Detecta o tema do sistema na primeira carga
  useEffect(() => {
    const temaSalvo = localStorage.getItem('gsa-theme')
    const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (temaSalvo) {
      setTema(temaSalvo)
    } else if (prefereDark) {
      setTema('dark')
    } else {
      setTema('light')
    }
  }, [])

  const toggleTema = () => {
    const novoTema = tema === 'dark' ? 'light' : 'dark'
    setTema(novoTema)
    localStorage.setItem('gsa-theme', novoTema)
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
    <main className={`min-h-screen p-4 md:p-8 font-sans transition-colors duration-500 ${tema === 'dark' ? 'bg-[#050505] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* HEADER COM BOTÃO DE TEMA */}
      <header className={`flex justify-between items-center mb-12 p-6 rounded-[2rem] border transition-all ${tema === 'dark' ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div>
          <h1 className={`text-2xl font-black italic tracking-tighter uppercase ${tema === 'dark' ? 'text-blue-500' : 'text-blue-600'}`}>GSA GESTÃO</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50">Gomes Serviços Ágeis</p>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTema}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all active:scale-90 ${tema === 'dark' ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-white'}`}
          >
            {tema === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black opacity-50 uppercase italic">Acesso Master</p>
            <p className="font-bold text-xs uppercase">{user?.email?.split('@')[0]}</p>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Vendas Hoje', val: 'R$ 0,00', cor: 'text-green-500' },
          { label: 'Produtos', val: '0 Itens', cor: 'text-blue-500' },
          { label: 'Alertas', val: '0 Críticos', cor: 'text-orange-500' }
        ].map((kpi, i) => (
          <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${tema === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <p className="opacity-50 text-[10px] font-black uppercase mb-4 tracking-widest">{kpi.label}</p>
            <h2 className={`text-4xl font-black tracking-tighter ${kpi.cor}`}>{kpi.val}</h2>
          </div>
        ))}
      </div>

      {/* MÓDULOS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota}>
            <div className="group cursor-pointer">
              <div className={`${m.cor} h-24 rounded-[2rem] flex items-center justify-center text-3xl mb-3 shadow-xl group-hover:scale-105 transition-all`}>
                {m.icon}
              </div>
              <p className={`text-center font-black text-[10px] uppercase tracking-tighter ${tema === 'dark' ? 'text-white' : 'text-gray-700'}`}>{m.nome}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}