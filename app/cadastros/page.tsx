'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Inventario() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [form, setForm] = useState({ nome: '', preco: '', custo: '', estoque: '', min: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data, error } = await supabase.from('produtos').select('*').order('nome')
    if (error) {
      console.error("Erro ao carregar:", error.message)
    } else {
      setProdutos(data || [])
    }
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.from('produtos').insert([{
      nome: form.nome.toUpperCase(),
      preco_venda: parseFloat(form.preco),
      preco_custo: parseFloat(form.custo) || 0,
      estoque_atual: parseInt(form.estoque),
      estoque_minimo: parseInt(form.min) || 5
    }])

    if (error) {
      setErro("Erro ao salvar: " + error.message)
    } else {
      setForm({ nome: '', preco: '', custo: '', estoque: '', min: '' })
      carregarProdutos()
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-2 block tracking-[0.3em]">← Painel GSA</Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Estoque / Cadastro</h1>
          </div>
          <div className="bg-gray-900 px-6 py-3 rounded-2xl border border-gray-800">
             <p className="text-[10px] font-black text-gray-500 uppercase">Total de Itens</p>
             <p className="text-xl font-black text-blue-500">{produtos.length}</p>
          </div>
        </header>

        {/* Formulário de Cadastro */}
        <section className="bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800 mb-12 shadow-2xl">
          <h2 className="text-[10px] font-black text-blue-500 uppercase mb-6 tracking-widest">Registrar Novo Produto</h2>
          
          {erro && <p className="text-red-500 text-[10px] font-bold mb-4 uppercase bg-red-500/10 p-2 rounded-lg border border-red-500/20">{erro}</p>}

          <form onSubmit={salvarProduto} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-gray-600 ml-2 uppercase">Descrição do Item</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" placeholder="EX: MOUSE SEM FIO" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 ml-2 uppercase">Preço Venda</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold text-green-500" type="number" step="0.01" placeholder="0.00" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 ml-2 uppercase">Qtd em Estoque</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl outline-none focus:border-blue-500 border border-transparent font-bold" type="number" placeholder="0" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 ml-2 uppercase">Preço Custo</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl outline-none border border-transparent font-bold" type="number" step="0.01" placeholder="0.00" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 ml-2 uppercase">Alerta Mínimo</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl outline-none border border-transparent font-bold" type="number" placeholder="5" value={form.min} onChange={e => setForm({...form, min: e.target.value})} />
            </div>

            <button disabled={loading} className="md:col-span-2 bg-blue-600 rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg active:scale-95 h-[58px] mt-auto">
              {loading ? 'SALVANDO...' : 'FINALIZAR CADASTRO GSA'}
            </button>
          </form>
        </section>

        {/* Lista de Itens */}
        <div className="bg-gray-900/40 rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-gray-800/50 text-gray-500 font-black uppercase">
              <tr>
                <th className="p-6">Descrição</th>
                <th className="p-6 text-center">Venda</th>
                <th className="p-6 text-center">Estoque</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-bold uppercase">
              {produtos.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-all">
                  <td className="p-6">{p.nome}</td>
                  <td className="p-6 text-center text-green-500">R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td className="p-6 text-center">{p.estoque_atual} UN</td>
                  <td className="p-6 text-right">
                    {p.estoque_atual <= (p.estoque_minimo || 5) ? (
                      <span className="text-red-500 bg-red-500/10 px-4 py-2 rounded-xl text-[9px] border border-red-500/20">REPOR</span>
                    ) : (
                      <span className="text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl text-[9px] border border-blue-500/20">DISPONÍVEL</span>
                    )}
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr><td colSpan={4} className="p-20 text-center text-gray-600 font-black uppercase tracking-widest">Nenhum produto cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}