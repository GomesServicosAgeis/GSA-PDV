'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Financeiro() {
  const [contas, setContas] = useState<any[]>([])
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('DESPESA')
  const [vencimento, setVencimento] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { carregarFinanceiro() }, [])

  async function carregarFinanceiro() {
    const { data } = await supabase.from('financeiro').select('*').order('data_vencimento', { ascending: true })
    if (data) setContas(data)
  }

  async function adicionarConta(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('financeiro').insert([
      { descricao, valor: parseFloat(valor), tipo, data_vencimento: vencimento, status: 'PENDENTE' }
    ])
    if (!error) {
      setDescricao(''); setValor(''); setVencimento('')
      carregarFinanceiro()
    }
    setLoading(false)
  }

  const saldo = contas.reduce((acc, c) => c.tipo === 'RECEITA' ? acc + c.valor : acc - c.valor, 0)

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-2 block tracking-widest">← Voltar ao Painel</Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Financeiro GSA</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Saldo em Caixa</p>
            <h2 className={`text-3xl font-black tracking-tighter ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {saldo.toFixed(2)}
            </h2>
          </div>
        </header>

        {/* Lançamento Rápido */}
        <form onSubmit={adicionarConta} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-900/40 p-6 rounded-[2rem] border border-gray-800 mb-10 shadow-2xl">
          <input className="md:col-span-2 bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold text-sm" placeholder="DESCRIÇÃO (EX: BOLETO ALUGUEL)" value={descricao} onChange={e => setDescricao(e.target.value)} required />
          <input className="bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold text-sm" type="number" step="0.01" placeholder="VALOR R$" value={valor} onChange={e => setValor(e.target.value)} required />
          <input className="bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold text-sm text-gray-400" type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} required />
          <button className="bg-blue-600 rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            {loading ? '...' : 'Lançar'}
          </button>
        </form>

        {/* Listagem de Contas */}
        <div className="space-y-3">
          {contas.map(item => (
            <div key={item.id} className="bg-gray-900/60 p-5 rounded-[1.5rem] border border-gray-800 flex justify-between items-center group hover:border-gray-700 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${item.tipo === 'RECEITA' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-black uppercase text-sm tracking-tighter">{item.descricao}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vence em: {new Date(item.data_vence || item.data_vencimento).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-black tracking-tighter ${item.tipo === 'RECEITA' ? 'text-green-500' : 'text-white'}`}>
                  {item.tipo === 'RECEITA' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                </p>
                <span className="text-[8px] font-black bg-gray-800 px-2 py-1 rounded text-gray-400 uppercase">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}