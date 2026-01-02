'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CadastroPro() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ ean: '', nome: '', preco: '', custo: '', estoque: '', min: '5' })
  const [itemExistente, setItemExistente] = useState<any>(null)

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('created_at', { ascending: false }).limit(10)
    if (data) setProdutos(data)
  }

  // BUSCA AUTOMÁTICA POR EAN
  async function buscarEAN(ean: string) {
    setForm({ ...form, ean })
    if (ean.length >= 8) {
      const { data } = await supabase.from('produtos').select('*').eq('codigo_ean', ean).single()
      if (data) {
        setItemExistente(data)
        setForm({ ...form, ean, nome: data.nome, preco: data.preco_venda, custo: data.preco_custo })
      } else {
        setItemExistente(null)
      }
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (itemExistente) {
      // ATUALIZA ESTOQUE (Soma o que já tinha + o novo)
      const novoEstoque = Number(itemExistente.estoque_atual) + Number(form.estoque)
      await supabase.from('produtos').update({ estoque_atual: novoEstoque }).eq('id', itemExistente.id)
    } else {
      // CRIA NOVO
      await supabase.from('produtos').insert([{
        codigo_ean: form.ean,
        nome: form.nome.toUpperCase(),
        preco_venda: parseFloat(form.preco),
        preco_custo: parseFloat(form.custo) || 0,
        estoque_atual: parseInt(form.estoque),
        estoque_minimo: parseInt(form.min)
      }])
    }

    setForm({ ean: '', nome: '', preco: '', custo: '', estoque: '', min: '5' })
    setItemExistente(null)
    carregarProdutos()
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-4 block tracking-widest">← Voltar ao Painel</Link>
        
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase underline decoration-blue-500 decoration-4">Entrada de Mercadoria</h1>
          <button className="bg-gray-800 px-6 py-3 rounded-2xl font-black text-[10px] uppercase border border-gray-700 hover:bg-gray-700 transition-all">
            📂 Importar XML (Em breve)
          </button>
        </div>

        <form onSubmit={salvar} className="bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800 mb-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="md:col-span-1">
              <label className="text-[9px] font-black text-blue-500 ml-2 uppercase">Cód. Barras (EAN)</label>
              <input 
                className="w-full bg-gray-800 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 font-bold text-xl"
                placeholder="0000000000" value={form.ean} onChange={e => buscarEAN(e.target.value)} required
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Nome do Produto {itemExistente && <span className="text-green-500">- ITEM LOCALIZADO</span>}</label>
              <input 
                className={`w-full p-4 rounded-2xl outline-none border-2 border-transparent font-bold text-xl ${itemExistente ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-800 text-white focus:border-blue-500'}`}
                placeholder="DESCRIÇÃO DO PRODUTO" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required disabled={!!itemExistente}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 md:col-span-4 gap-4">
               <div>
                 <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Preço Venda</label>
                 <input className="w-full bg-gray-800 p-4 rounded-2xl font-bold" type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
               </div>
               <div>
                 <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Preço Custo</label>
                 <input className="w-full bg-gray-800 p-4 rounded-2xl font-bold" type="number" step="0.01" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} />
               </div>
               <div>
                 <label className="text-[9px] font-black text-blue-500 ml-2 uppercase">Qtd Entrada</label>
                 <input className="w-full bg-blue-600/20 border-2 border-blue-500/40 p-4 rounded-2xl font-black text-center text-xl" type="number" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} required />
               </div>
               <button className="bg-blue-600 rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                 {itemExistente ? 'ADICIONAR ESTOQUE' : 'CADASTRAR NOVO'}
               </button>
            </div>
          </div>
        </form>

        {/* Histórico Recente */}
        <div className="bg-gray-900/20 rounded-[2rem] border border-gray-800 p-6 overflow-hidden">
          <p className="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest">Últimas Entradas</p>
          <div className="space-y-2">
            {produtos.map(p => (
              <div key={p.id} className="bg-gray-900 p-4 rounded-xl flex justify-between items-center border border-gray-800">
                <span className="font-bold text-sm uppercase">{p.nome}</span>
                <span className="text-blue-500 font-black">{p.estoque_atual} UN</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}