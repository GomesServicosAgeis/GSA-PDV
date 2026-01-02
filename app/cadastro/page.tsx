'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Inventario() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [form, setForm] = useState({ nome: '', preco: '', custo: '', estoque: '', min: '' })

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase.from('produtos').select('*').order('nome')
      if (data) setProdutos(data)
    }
    carregar()
  }, [])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('produtos').insert([{
      nome: form.nome.toUpperCase(),
      preco_venda: parseFloat(form.preco),
      preco_custo: parseFloat(form.custo) || 0,
      estoque_atual: parseInt(form.estoque),
      estoque_minimo: parseInt(form.min) || 5
    }])
    if (!error) {
      setForm({ nome: '', preco: '', custo: '', estoque: '', min: '' })
      const { data } = await supabase.from('produtos').select('*').order('nome')
      if (data) setProdutos(data)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-4 block">← Voltar</Link>
      <h1 className="text-3xl font-black italic mb-8 uppercase italic tracking-tighter">Estoque GSA</h1>
      
      <form onSubmit={salvar} className="bg-gray-900/50 p-6 rounded-[2rem] border border-gray-800 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input className="md:col-span-3 bg-gray-800 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 font-bold" placeholder="NOME DO PRODUTO" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
        <input className="bg-gray-800 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 font-bold" type="number" step="0.01" placeholder="PREÇO VENDA" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
        <input className="bg-gray-800 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 font-bold" type="number" placeholder="ESTOQUE" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} required />
        <button className="bg-blue-600 rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-all">Cadastrar</button>
      </form>

      <div className="bg-gray-900/30 rounded-[2rem] border border-gray-800 overflow-hidden">
        {produtos.map(p => (
          <div key={p.id} className="p-4 border-b border-gray-800 flex justify-between uppercase font-bold text-xs">
            <span>{p.nome}</span>
            <span className="text-blue-500">{p.estoque_atual} UN</span>
          </div>
        ))}
      </div>
    </main>
  )
}