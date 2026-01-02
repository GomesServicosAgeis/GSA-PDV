'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Inventario() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [form, setForm] = useState({ nome: '', preco: '', custo: '', estoque: '', min: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('nome')
    if (data) setProdutos(data)
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('produtos').insert([{
      nome: form.nome.toUpperCase(),
      preco_venda: parseFloat(form.preco),
      preco_custo: parseFloat(form.custo),
      estoque_atual: parseInt(form.estoque),
      estoque_minimo: parseInt(form.min)
    }])
    setForm({ nome: '', preco: '', custo: '', estoque: '', min: '' })
    carregarProdutos()
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-2 block tracking-[0.3em]">← Voltar ao Painel</Link>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Gestão de Estoque</h1>
        </header>

        {/* Cadastro de Produto */}
        <form onSubmit={salvarProduto} className="bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800 mb-12 shadow-2xl">
          <p className="text-[10px] font-black text-blue-500 uppercase mb-6 tracking-widest">Novo Item no Inventário</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="md:col-span-2 bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" placeholder="NOME DO PRODUTO" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            <input className="bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" type="number" step="0.01" placeholder="PREÇO VENDA R$" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
            <input className="bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" type="number" step="0.01" placeholder="PREÇO CUSTO R$" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} />
            <input className="bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" type="number" placeholder="QTD INICIAL" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} required />
            <input className="bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" type="number" placeholder="AVISO ESTOQUE MÍN" value={form.min} onChange={e => setForm({...form, min: e.target.value})} />
            <button className="md:col-span-2 bg-blue-600 rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              {loading ? 'PROCESSANDO...' : 'CADASTRAR PRODUTO'}
            </button>
          </div>
        </form>

        {/* Tabela de Produtos */}
        <div className="bg-gray-900/40 rounded-[2rem] border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800/50 text-gray-500 font-black uppercase">
              <tr>
                <th className="p-5">Produto</th>
                <th className="p-5">Venda</th>
                <th className="p-5">Estoque</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-bold uppercase">
              {produtos.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-5">{p.nome}</td>
                  <td className="p-5 text-green-500">R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td className="p-5">{p.estoque_atual} un</td>
                  <td className="p-5">
                    {p.estoque_atual <= p.estoque_minimo ? (
                      <span className="text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-[9px]">REPOR URGENTE</span>
                    ) : (
                      <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full text-[9px]">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}