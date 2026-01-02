'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { XMLParser } from 'fast-xml-parser'

export default function CadastroGSA() {
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

  // Lógica para ler o arquivo XML da Nota Fiscal
  const handleXMLImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parser = new XMLParser()
        const jObj = parser.parse(event.target?.result as string)
        const det = jObj.nfeProc?.NFe?.infNFe?.det || jObj.NFe?.infNFe?.det
        const pNota = Array.isArray(det) ? det[0].prod : det.prod

        if (pNota) {
          setForm({
            ean: String(pNota.cEAN || ''),
            nome: String(pNota.xProd).toUpperCase(),
            custo: String(pNota.vUnCom),
            preco: String((Number(pNota.vUnCom) * 1.5).toFixed(2)), // Sugestão 50% margem
            estoque: String(pNota.qCom),
            min: '5',
            tipo: 'PRODUTO'
          })
          alert("Produto importado do XML! Verifique os valores antes de salvar.")
        }
      } catch (err) {
        alert("Erro ao ler XML. Verifique se o arquivo é uma NF-e válida.")
      }
    }
    reader.readAsText(file)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (modoEdicao && idEditando) {
      // ATUALIZAR (Sem mexer no estoque por segurança)
      await supabase.from('produtos').update({
        nome: form.nome.toUpperCase(),
        preco_venda: parseFloat(form.preco),
        preco_custo: parseFloat(form.custo) || 0,
        estoque_minimo: parseInt(form.min),
        tipo: form.tipo
      }).eq('id', idEditando)
    } else {
      // NOVO CADASTRO
      const eanFinal = form.tipo === 'SERVICO' && !form.ean ? `SRV-${Date.now()}` : form.ean
      await supabase.from('produtos').insert([{
        codigo_ean: eanFinal,
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
    setForm({ 
      ean: p.codigo_ean, nome: p.nome, preco: p.preco_venda, 
      custo: p.preco_custo, estoque: p.estoque_atual, min: p.estoque_minimo, tipo: p.tipo 
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const limparForm = () => {
    setForm({ ean: '', nome: '', preco: '', custo: '', estoque: '0', min: '5', tipo: 'PRODUTO' })
    setModoEdicao(false)
    setIdEditando(null)
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-500 font-black text-[10px] uppercase mb-2 block tracking-widest">← Painel GSA</Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              {modoEdicao ? '⚙️ Ajustar Cadastro' : '📦 Novo Item / Serviço'}
            </h1>
          </div>
          {!modoEdicao && (
            <label className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase cursor-pointer hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
              📂 IMPORTAR XML
              <input type="file" accept=".xml" onChange={handleXMLImport} className="hidden" />
            </label>
          )}
        </header>

        <form onSubmit={salvar} className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] mb-10 shadow-2xl relative">
          {/* Seletor de Tipo */}
          <div className="flex gap-4 mb-8">
            <button type="button" onClick={() => !modoEdicao && setForm({...form, tipo: 'PRODUTO'})} 
              className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs transition-all ${form.tipo === 'PRODUTO' ? 'bg-blue-600 text-white' : 'bg-gray-500/10 opacity-50'}`}>
              📦 Mercadoria
            </button>
            <button type="button" onClick={() => !modoEdicao && setForm({...form, tipo: 'SERVICO'})} 
              className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs transition-all ${form.tipo === 'SERVICO' ? 'bg-purple-600 text-white' : 'bg-gray-500/10 opacity-50'}`}>
              🛠️ Mão de Obra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="text-[9px] font-black opacity-50 ml-2 uppercase">Código/EAN</label>
              <input className="w-full bg-gray-500/10 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none" 
                placeholder="Automático" value={form.ean} onChange={e => setForm({...form, ean: e.target.value})} disabled={modoEdicao} />
            </div>
            <div className="md:col-span-3">
              <label className="text-[9px] font-black opacity-50 ml-2 uppercase">Descrição</label>
              <input className="w-full bg-gray-500/10 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none" 
                value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 md:col-span-4 gap-4">
               <div>
                 <label className="text-[9px] font-black text-green-500 ml-2 uppercase">Preço Venda</label>
                 <input className="w-full bg-gray-500/10 p-4 rounded-2xl font-black text-green-500 text-xl outline-none" type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
               </div>
               <div>
                 <label className="text-[9px] font-black opacity-50 ml-2 uppercase">Custo</label>
                 <input className="w-full bg-gray-500/10 p-4 rounded-2xl font-bold text-xl outline-none" type="number" step="0.01" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} />
               </div>
               <div>
                 <label className="text-[9px] font-black opacity-50 ml-2 uppercase">Estoque Atual</label>
                 <input className={`w-full p-4 rounded-2xl font-black text-xl text-center outline-none ${modoEdicao || form.tipo === 'SERVICO' ? 'opacity-30' : 'bg-blue-600/10 text-blue-500'}`} 
                   type="number" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} disabled={modoEdicao || form.tipo === 'SERVICO'} />
               </div>

               <div className="flex gap-2 items-end">
                 <button disabled={loading} className={`flex-1 rounded-2xl font-black uppercase text-[10px] h-[60px] transition-all shadow-lg ${modoEdicao ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}`}>
                   {loading ? 'Processando...' : modoEdicao ? 'Salvar Ajustes' : 'Confirmar Cadastro'}
                 </button>
                 {modoEdicao && <button type="button" onClick={limparForm} className="bg-red-500/10 text-red-500 px-4 rounded-2xl h-[60px] font-black">X</button>}
               </div>
            </div>
          </div>
        </form>

        {/* Tabela de Itens */}
        <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-500/5 text-gray-500 font-black uppercase">
              <tr>
                <th className="p-6">Tipo</th>
                <th className="p-6">Nome</th>
                <th className="p-6">Preço</th>
                <th className="p-6">Estoque</th>
                <th className="p-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-bold uppercase">
              {produtos.map(p => (
                <tr key={p.id} className="hover:bg-gray-500/5 transition-all">
                  <td className="p-6">{p.tipo === 'SERVICO' ? '🛠️' : '📦'}</td>
                  <td className="p-6">{p.nome}</td>
                  <td className="p-6 text-green-500 font-black">R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td className="p-6">{p.tipo === 'SERVICO' ? '∞' : `${p.estoque_atual} UN`}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => prepararEdicao(p)} className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                      EDITAR
                    </button>
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