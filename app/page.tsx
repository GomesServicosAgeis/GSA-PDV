'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Cadastro() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [busca, setBusca] = useState('')
  
  const [form, setForm] = useState({
    nome: '',
    preco_custo: '',
    preco_venda: '',
    margem_lucro: '',
    estoque_atual: '',
    codigo_ean: '',
    codigo_interno: '',
    fornecedor: '',
    categoria_id: '',
    subcategoria_id: ''
  })

  async function carregarDados() {
    const { data: p } = await supabase.from('produtos').select('*, categorias(nome)').order('nome')
    const { data: c } = await supabase.from('categorias').select('*, subcategorias(*)')
    if (p) setProdutos(p)
    if (c) setCategorias(c)
  }

  useEffect(() => { carregarDados() }, [])

  useEffect(() => {
    const cat = categorias.find(c => c.id === form.categoria_id)
    setSubcategoriasFiltradas(cat?.subcategorias || [])
  }, [form.categoria_id, categorias])

  // Lógica de Precificação Automática
  const calcularPelaMargem = (custo: string, margem: string) => {
    const c = parseFloat(custo) || 0
    const m = parseFloat(margem) || 0
    if (c > 0) {
      const venda = c + (c * (m / 100))
      setForm(prev => ({ ...prev, preco_venda: venda.toFixed(2) }))
    }
  }

  const calcularPelaVenda = (custo: string, venda: string) => {
    const c = parseFloat(custo) || 0
    const v = parseFloat(venda) || 0
    if (c > 0 && v > 0) {
      const margem = ((v - c) / c) * 100
      setForm(prev => ({ ...prev, margem_lucro: margem.toFixed(2) }))
    }
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault()

    if (!form.nome || !form.fornecedor || !form.estoque_atual || !form.preco_custo || !form.categoria_id) {
      alert('⚠️ CAMPOS OBRIGATÓRIOS: Descrição, Fornecedor, Estoque, Preço de Custo e Categoria!')
      return
    }

    setLoading(true)
    const dados = { 
      nome: form.nome, 
      preco_custo: parseFloat(form.preco_custo),
      preco_venda: parseFloat(form.preco_venda), 
      estoque_atual: parseInt(form.estoque_atual),
      codigo_ean: form.codigo_ean,
      codigo_interno: form.codigo_interno || `GSA-${Date.now().toString().slice(-4)}`,
      fornecedor: form.fornecedor,
      categoria_id: form.categoria_id,
      subcategoria_id: form.subcategoria_id || null
    }

    const { error } = editando 
      ? await supabase.from('produtos').update(dados).eq('id', editando.id)
      : await supabase.from('produtos').insert([dados])

    if (error) alert('Erro ao salvar!')
    else {
      setEditando(null)
      setForm({ nome: '', preco_custo: '', preco_venda: '', margem_lucro: '', estoque_atual: '', codigo_ean: '', codigo_interno: '', fornecedor: '', categoria_id: '', subcategoria_id: '' })
      carregarDados()
    }
    setLoading(false)
  }

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.codigo_interno?.includes(busca)
  )

  return (
    <main className="p-10 max-w-7xl mx-auto text-black font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-blue-600 italic tracking-tighter">GSA PDV</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Sistemas de Gestão Ágil</p>
        </div>
        <div className="flex gap-4">
          <Link href="/categorias" className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:border-blue-500 transition-all">Categorias</Link>
          <Link href="/pdv" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">ABRIR CAIXA</Link>
        </div>
      </div>
      
      <form onSubmit={salvarProduto} className="mb-10 p-8 border-2 bg-white rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Item *</label>
          <input type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full p-4 border-2 border-gray-100 rounded-2xl mt-1 font-bold focus:border-blue-500 outline-none bg-gray-50" placeholder="Nome do Produto" />
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fornecedor *</label>
          <input type="text" value={form.fornecedor} onChange={e => setForm({...form, fornecedor: e.target.value})} className="w-full p-4 border-2 border-gray-100 rounded-2xl mt-1 font-bold focus:border-blue-500 outline-none bg-gray-50" />
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque Atual *</label>
          <input type="number" value={form.estoque_atual} onChange={e => setForm({...form, estoque_atual: e.target.value})} className="w-full p-4 border-2 border-gray-100 rounded-2xl mt-1 font-bold focus:border-blue-500 outline-none bg-gray-50" />
        </div>

        {/* Bloco de Precificação Inteligente */}
        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-blue-50/50 rounded-3xl border-2 border-blue-100">
           <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Preço de Custo (R$) *</label>
              <input type="number" step="0.01" value={form.preco_custo} 
                onChange={e => {
                  setForm({...form, preco_custo: e.target.value})
                  calcularPelaMargem(e.target.value, form.margem_lucro)
                }} 
                className="w-full p-4 border-2 border-white rounded-2xl mt-1 font-black text-red-600 text-xl outline-none" 
              />
           </div>
           <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Margem de Lucro (%)</label>
              <input type="number" step="0.1" value={form.margem_lucro} 
                onChange={e => {
                  setForm({...form, margem_lucro: e.target.value})
                  calcularPelaMargem(form.preco_custo, e.target.value)
                }} 
                className="w-full p-4 border-2 border-white rounded-2xl mt-1 font-black text-blue-600 text-xl outline-none" 
              />
           </div>
           <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Preço de Venda Final (R$)</label>
              <input type="number" step="0.01" value={form.preco_venda} 
                onChange={e => {
                  setForm({...form, preco_venda: e.target.value})
                  calcularPelaVenda(form.preco_custo, e.target.value)
                }} 
                className="w-full p-4 border-2 border-white rounded-2xl mt-1 font-black text-green-600 text-xl outline-none" 
              />
           </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria *</label>
          <select value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value, subcategoria_id: ''})} className="w-full p-4 border-2 border-gray-100 rounded-2xl mt-1 font-bold bg-gray-50 outline-none">
            <option value="">Selecionar...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subcategoria</label>
          <select value={form.subcategoria_id} onChange={e => setForm({...form, subcategoria_id: e.target.value})} className="w-full p-4 border-2 border-gray-100 rounded-2xl mt-1 font-bold bg-gray-50 outline-none" disabled={!form.categoria_id}>
            <option value="">Nenhuma...</option>
            {subcategoriasFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        <div className="md:col-span-2 flex items-end">
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl active:scale-95">
            {loading ? 'PROCESSANDO...' : editando ? 'ATUALIZAR PRODUTO' : 'FINALIZAR CADASTRO GSA'}
          </button>
        </div>
      </form>

      {/* Listagem com Pesquisa */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-white">
        <div className="p-8 bg-gray-900 flex flex-col md:row justify-between items-center gap-6">
           <h2 className="text-white font-black text-2xl italic tracking-tighter">INVENTÁRIO DE PRODUTOS</h2>
           <input 
              type="text" 
              placeholder="🔍 Pesquisar por nome ou código..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full md:w-1/3 p-4 rounded-2xl outline-none font-bold text-sm"
           />
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b">
            <tr>
              <th className="p-8">Item / Categoria</th>
              <th className="p-8 text-center">Qtd. Estoque</th>
              <th className="p-8 text-right">Valor Venda</th>
              <th className="p-8 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map(p => (
              <tr key={p.id} className="border-b hover:bg-blue-50/30 transition-all">
                <td className="p-8">
                  <div className="font-black text-gray-800 text-lg uppercase leading-tight">{p.nome}</div>
                  <div className="text-[10px] text-blue-500 font-black uppercase mt-1">
                    {p.categorias?.nome || 'Sem Categoria'} {p.codigo_interno ? `| CID: ${p.codigo_interno}` : ''}
                  </div>
                </td>
                <td className="p-8 text-center">
                  <span className={`px-6 py-2 rounded-2xl text-xs font-black border-2 ${p.estoque_atual < 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {p.estoque_atual} UN
                  </span>
                </td>
                <td className="p-8 text-right">
                  <div className="text-[10px] text-gray-400 font-bold italic mb-1">Margem Sugerida: {p.preco_custo > 0 ? (((p.preco_venda - p.preco_custo) / p.preco_custo) * 100).toFixed(0) : 0}%</div>
                  <div className="font-black text-gray-900 text-2xl tracking-tighter">R$ {Number(p.preco_venda).toFixed(2)}</div>
                </td>
                <td className="p-8 text-center">
                   <button onClick={() => { setEditando(p); setForm({ ...p, categoria_id: p.categoria_id || '', subcategoria_id: p.subcategoria_id || '', margem_lucro: p.preco_custo > 0 ? (((p.preco_venda - p.preco_custo) / p.preco_custo) * 100).toFixed(2) : '' }); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="font-black text-xs bg-gray-100 px-6 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">EDITAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}