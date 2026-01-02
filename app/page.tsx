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
    const temaSalvo = localStorage.getItem('gsa-theme') || 'dark'
    setTema(temaSalvo)
    document.documentElement.setAttribute('data-theme', temaSalvo)

    async function carregarDados() {
      try {
        const { count: p } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
        const { count: c } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).lte('estoque_atual', 5)
        setStats(prev => ({ ...prev, produtos: p || 0, critico: c || 0 }))
      } catch (err) {
        console.error("Erro ao carregar dados GSA:", err)
      } finally {
        setLoading(false)
      }
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

  // Estilos de segurança (Fallback)
  const mainStyle: React.CSSProperties = {
    backgroundColor: tema === 'dark' ? '#050505' : '#f3f4f6',
    color: tema === 'dark' ? '#ffffff' : '#111827',
    minHeight: '100vh',
    padding: '32px',
    transition: 'all 0.3s ease'
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: tema === 'dark' ? '#0f0f0f' : '#ffffff',
    border: `1px solid ${tema === 'dark' ? '#1f2937' : '#e5e7eb'}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: '#3b82f6', fontWeight: '900'}}>GSA GESTÃO...</div>

  return (
    <main style={mainStyle} className="gsa-main">
      <header style={{...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <div>
          <h1 style={{fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '-1px'}}>GSA GESTÃO</h1>
          <p style={{fontSize: '10px', fontWeight: 'bold', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px'}}>Painel de Controle</p>
        </div>
        <button 
          onClick={() => {
            const nt = tema === 'dark' ? 'light' : 'dark'
            setTema(nt)
            localStorage.setItem('gsa-theme', nt)
            document.documentElement.setAttribute('data-theme', nt)
          }}
          style={{cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', border: '1px solid #3b82f640', background: '#3b82f610', color: '#3b82f6', fontWeight: 'bold'}}
        >
          {tema === 'dark' ? '☀️ CLARO' : '🌙 ESCURO'}
        </button>
      </header>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div style={cardStyle}>
          <p style={{fontSize: '10px', fontWeight: '900', opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px'}}>Faturamento Hoje</p>
          <h2 style={{fontSize: '40px', fontWeight: '900', color: '#22c55e'}}>R$ {stats.faturamento.toFixed(2)}</h2>
        </div>
        <div style={cardStyle}>
          <p style={{fontSize: '10px', fontWeight: '900', opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px'}}>Produtos Cadastrados</p>
          <h2 style={{fontSize: '40px', fontWeight: '900', color: '#3b82f6'}}>{stats.produtos} <span style={{fontSize: '14px', opacity: 0.3}}>ITENS</span></h2>
        </div>
        <div style={cardStyle}>
          <p style={{fontSize: '10px', fontWeight: '900', opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px'}}>Estoque Crítico</p>
          <h2 style={{fontSize: '40px', fontWeight: '900', color: '#f97316'}}>{stats.critico} <span style={{fontSize: '14px', opacity: 0.3}}>ALERTAS</span></h2>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px'}}>
        {modulos.map((m) => (
          <Link key={m.nome} href={m.rota} style={{textDecoration: 'none', color: 'inherit'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{backgroundColor: m.cor, width: '100%', height: '110px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'}}>
                {m.icon}
              </div>
              <p style={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.6}}>{m.nome}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}