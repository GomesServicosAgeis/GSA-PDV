'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { XMLParser } from 'fast-xml-parser'

export default function CadastroHibrido() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEditando, setIdEditando] = useState<string | null>(null)
  
  const [form, setForm] = useState({ 
    ean: '', nome: '', preco: '', custo: '', estoque: '0', min: '5', tipo: 'PRODUTO' 
  })

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('created_at', { ascending: false })
    if (data) setProdutos(data)
  }

  const handleXMLImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const parser = new XMLParser()
      const jObj = parser.parse(event.target?.result as string)
      const produtosNota = jObj.nfeProc?.NFe?.infNFe?.det || jObj.NFe?.infNFe?.det
      if (produtosNota) {
        const p = Array.isArray(produtosNota) ? produtosNota[0].prod : produtosNota.prod
        setForm({ ean: String(p.cEAN), nome: String(p.xProd).toUpperCase(), custo: String(p.vUnCom), preco: String(Number(p.vUnCom) * 1.5), estoque: String(p.qCom), min: '5', tipo: 'PRODUTO' })
      }
    }
    reader.readAsText(file)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (modoEdicao && idEditando) {
      // Edição: Bloqueamos o campo estoque no SQL/Update por segurança
      await supabase.from('produtos').update({
        nome: form.nome.toUpperCase(),
        preco_venda: parseFloat(form.preco),
        preco_custo: parseFloat(form.custo) || 0,
        estoque_minimo: parseInt(form.min),
        tipo: form.tipo
      }).eq('id', idEditando)
    } else {
      // Novo Cadastro
      const codigoFinal = form.tipo === 'SERVICO' && !form.ean ? `SRV-${Date.now()}` : form.ean
      await supabase.from('produtos').insert([{
        codigo_ean: codigoFinal,
        nome: form.nome.toUpperCase(),
        preco_venda: parseFloat(form.preco),
        preco_custo: parseFloat(form.custo) || 0,
        estoque_atual: form.tipo === 'SERVICO' ? 999999 : parseInt(form.estoque),
        estoque_minimo: parseInt(form.min),
        tipo: form.tipo
      }])
    }

    limparForm()
    carregarProdutos()
    setLoading(false)
  }

  const prepararEdicao = (p: any) => {
    setModoEdicao(true)
    setIdEditando(p.id)
    setForm({ ean: p.codigo_ean, nome: p.nome, preco: p.preco_venda, custo: p.preco_custo, estoque: p.estoque_atual, min: p.estoque_minimo, tipo: p.tipo })
  }

  const limparForm = () => {
    setForm({ ean: '', nome: '', preco: '', custo: '', estoque: '0', min: '5', tipo: 'PRODUTO' })
    setModoEdicao(false)
    setIdEditando(null)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-2 block tracking-widest">← Voltar</Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">{modoEdicao ? 'Editando Item' : 'Cadastro Geral'}</h1>
          </div>
          {!modoEdicao && (
            <label className="bg-emerald-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase cursor-pointer hover:bg-emerald-700 transition-all">
              📂 XML NOTA FISCAL
              <input type="file" accept=".xml" onChange={handleXMLImport} className="hidden" />
            </label>
          )}
        </header>

        <form onSubmit={salvar} className="bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800 mb-10 shadow-2xl relative">
          <div className="flex gap-4 mb-8">
            <button type="button" onClick={() => setForm({...form, tipo: 'PRODUTO'})} className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs transition-all ${form.tipo === 'PRODUTO' ? 'bg-blue-600' : 'bg-gray-800 text-gray-500'}`}>📦 Produto Físico</button>
            <button type="button" onClick={() => setForm({...form, tipo: 'SERVICO'})} className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs transition-all ${form.tipo === 'SERVICO' ? 'bg-purple-600' : 'bg-gray-800 text-gray-500'}`}>🛠️ Serviço/Mão de Obra</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Identificador (EAN)</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500" placeholder="000000" value={form.ean} onChange={e => setForm({...form, ean: e.target.value})} disabled={modoEdicao} />
            </div>
            <div className="md:col-span-3">
              <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Descrição do {form.tipo}</label>
              <input className="w-full bg-gray-800 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 md:col-span-4 gap-4">
               <div><label className="text-[9px] font-black text-green-500 ml-2 uppercase">Preço Venda</label><input className="w-full bg-gray-800 p-4 rounded-2xl font-bold text-green-500 text-xl" type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required /></div>
               <div><label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Custo</label><input className="w-full bg-gray-800 p-4 rounded-2xl font-bold text-xl" type="number" step="0.01" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} /></div>
               
               {/* QUANTIDADE BLOQUEADA NA EDIÇÃO */}
               <div>
                 <label className="text-[9px] font-black text-gray-500 ml-2 uppercase">Estoque Atual</label>
                 <input className={`w-full p-4 rounded-2xl font-black text-xl text-center ${modoEdicao || form.tipo === 'SERVICO' ? 'bg-gray-900 text-gray-700' : 'bg-blue-600/20 text-white'}`} type="number" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} disabled={modoEdicao || form.tipo === 'SERVICO'} />
               </div>

               <div className="flex gap-2 items-end">
                 <button className={`flex-1 rounded-2xl font-black uppercase text-[10px] h-[60px] transition-all shadow-lg ${modoEdicao ? 'bg-orange-600' : 'bg-blue-600'}`}>
                   {loading ? '...' : modoEdicao ? 'Salvar Edição' : 'Cadastrar'}
                 </button>
                 {modoEdicao && <button type="button" onClick={limparForm} className="bg-gray-800 px-4 rounded-2xl h-[60px] font-black">X</button>}
               </div>
            </div>
          </div>
        </form>

        {/* Listagem Geral */}
        <div className="bg-gray-900/40 rounded-[2.5rem] border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800/50 text-gray-500 font-black uppercase">
              <tr><th className="p-6">Tipo</th><th className="p-6">Nome</th><th className="p-6">Preço</th><th className="p-6">Estoque</th><th className="p-6">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-bold uppercase">
              {produtos.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-all">
                  <td className="p-6">{p.tipo === 'SERVICO' ? '🛠️' : '📦'}</td>
                  <td className="p-6">{p.nome}</td>
                  <td className="p-6 text-green-500 font-black text-sm">R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td className="p-6">{p.tipo === 'SERVICO' ? '∞' : `${p.estoque_atual} UN`}</td>
                  <td className="p-6"><button onClick={() => prepararEdicao(p)} className="text-blue-500 hover:underline">EDITAR</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}