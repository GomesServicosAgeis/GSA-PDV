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
    { nome: 'Clientes', rota: '/clientes', icon: '👥', cor: '#10b981' },
    { nome: 'Fornecedores', rota: '/fornecedores', icon: '🚛', cor: '#8b5cf6' },
    { nome: 'Financeiro', rota: '/financeiro', icon: '💰', cor: '#ef4444' },
    { nome: 'Relatórios', rota: '/relatorios', icon: '📊', cor: '#71717a' },
  ]

  return (
    <div className="gsa-dashboard">
      <header className="gsa-header">
        <div>
          <h1 style={{ color: '#3b82f6', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>GSA GESTÃO</h1>
          <p style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '2px' }}>DASHBOARD</p>
        </div>
      </header>

      <div className="gsa-grid-stats">
        <div className="gsa-card-stat">
          <p style={{ opacity: 0.4, fontSize: '10px', fontWeight: 'bold' }}>PRODUTOS / SERVIÇOS</p>
          <h2 style={{ fontSize: '40px', color: '#3b82f6' }}>{stats.produtos}</h2>
        </div>
        <div className="gsa-card-stat">
          <p style={{ opacity: 0.4, fontSize: '10px', fontWeight: 'bold' }}>ESTOQUE CRÍTICO</p>
          <h2 style={{ fontSize: '40px', color: '#f97316' }}>{stats.critico}</h2>
        </div>
      </div>

      <div className="gsa-grid-modulos">
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota} className="gsa-modulo">
            <div className="gsa-box" style={{ backgroundColor: m.cor }}>
              {m.icon}
            </div>
            <p style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.7 }}>{m.nome}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}