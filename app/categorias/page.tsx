'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Categorias() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [nomeCat, setNomeCat] = useState('')
  const [nomeSub, setNomeSub] = useState('')
  const [catSelecionada, setCatSelecionada] = useState('')

  async function carregarDados() {
    const { data } = await supabase.from('categorias').select('*, subcategorias(*)').order('nome')
    if (data) setCategorias(data)
  }

  useEffect(() => { carregarDados() }, [])

  async function addCategoria(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeCat) return
    await supabase.from('categorias').insert([{ nome: nomeCat }])
    setNomeCat('')
    carregarDados()
  }

  async function addSubcategoria(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeSub || !catSelecionada) return
    await supabase.from('subcategorias').insert([{ nome: nomeSub, categoria_id: catSelecionada }])
    setNomeSub('')
    carregarDados()
  }

  return (
    <main className="p-10 max-w-4xl mx-auto text-black font-sans">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-black">GSA - Categorias</h1>
        <Link href="/" className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold">Voltar ao Cadastro</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Criar Categoria */}
        <form onSubmit={addCategoria} className="bg-white p-6 rounded-2xl shadow-lg border">
          <h2 className="font-bold mb-4">Nova Categoria</h2>
          <input type="text" value={nomeCat} onChange={e => setNomeCat(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="Ex: Bebidas" />
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">Salvar Categoria</button>
        </form>

        {/* Criar Subcategoria */}
        <form onSubmit={addSubcategoria} className="bg-white p-6 rounded-2xl shadow-lg border">
          <h2 className="font-bold mb-4">Nova Subcategoria</h2>
          <select value={catSelecionada} onChange={e => setCatSelecionada(e.target.value)} className="w-full p-3 border rounded-lg mb-4">
            <option value="">Selecionar Categoria Pai...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <input type="text" value={nomeSub} onChange={e => setNomeSub(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="Ex: Cervejas" />
          <button className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">Salvar Subcategoria</button>
        </form>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow-lg border overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-gray-100 uppercase text-xs font-black text-gray-400">
             <tr>
               <th className="p-4">Categoria</th>
               <th className="p-4">Subcategorias</th>
             </tr>
           </thead>
           <tbody>
             {categorias.map(c => (
               <tr key={c.id} className="border-b">
                 <td className="p-4 font-bold">{c.nome}</td>
                 <td className="p-4 flex gap-2 flex-wrap">
                   {c.subcategorias?.map((s: any) => (
                     <span key={s.id} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">{s.nome}</span>
                   ))}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </main>
  )
}