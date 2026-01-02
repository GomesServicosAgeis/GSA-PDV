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
    { nome: 'Vendas (PDV)', rota: '/pdv', icon: '🛒', cor: '#2563eb' },
    { nome: 'Estoque', rota: '/cadastro', icon: '📦', cor: '#ea580c' },
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: '#059669' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: '#9333ea' },
    { nome: 'Financeiro', rota: '/financeiro', icon: '💰', cor: '#dc2626' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: '#4b5563' },
  ]

  return (
    <main className="gsa-dashboard">
      
      <header className="gsa-header">
        <div>
          <h1 style={{color: '#3b82f6', fontSize: '32px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-1px'}}>GSA GESTÃO</h1>
          <p style={{fontSize: '10px', fontWeight: 'bold', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '3px'}}>Painel Administrativo</p>
        </div>
      </header>

      <div className="gsa-grid-stats">
        <div className="gsa-card-stat">
          <p style={{opacity: 0.4, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px'}}>Faturamento Hoje</p>
          <h2 style={{fontSize: '48px', fontWeight: '900', color: '#22c55e'}}>R$ 0,00</h2>
        </div>
        
        <div className="gsa-card-stat">
          <p style={{opacity: 0.4, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px'}}>Produtos / Serviços</p>
          <h2 style={{fontSize: '48px', fontWeight: '900', color: '#3b82f6'}}>{stats.produtos}</h2>
        </div>

        <div className="gsa-card-stat">
          <p style={{opacity: 0.4, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px'}}>Estoque Crítico</p>
          <h2 style={{fontSize: '48px', fontWeight: '900', color: '#f97316'}}>{stats.critico}</h2>
        </div>
      </div>

      <div className="gsa-grid-modulos">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota} className="gsa-btn-modulo">
            <div className="gsa-icon-box" style={{backgroundColor: m.cor}}>
              {m.icon}
            </div>
            <p style={{fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.6}}>{m.nome}</p>
          </Link>
        ))}
      </div>

    </main>
  )
}