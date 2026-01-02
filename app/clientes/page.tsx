'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome')
    if (data) setClientes(data)
  }

  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('clientes').insert([{ nome, telefone }])
    if (!error) {
      setNome(''); setTelefone('')
      carregarClientes()
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-500 font-black text-xs uppercase mb-4 block">← Voltar ao Painel</Link>
        <h1 className="text-3xl font-black italic mb-8 uppercase">Gestão de Clientes</h1>

        <form onSubmit={salvarCliente} className="bg-gray-900 p-6 rounded-3xl border border-gray-800 mb-10 flex gap-4">
          <input 
            className="flex-1 bg-gray-800 p-4 rounded-xl outline-none focus:border-blue-500 border border-transparent font-bold"
            placeholder="Nome do Cliente" value={nome} onChange={e => setNome(e.target.value)} required
          />
          <input 
            className="w-48 bg-gray-800 p-4 rounded-xl outline-none focus:border-blue-500 border border-transparent font-bold"
            placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)}
          />
          <button className="bg-blue-600 px-8 rounded-xl font-black uppercase hover:bg-blue-700 transition-all">
            {loading ? '...' : 'Adicionar'}
          </button>
        </form>

        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-[10px] font-black uppercase text-gray-400">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clientes.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/50 transition-all text-sm font-bold">
                  <td className="p-4 uppercase">{c.nome}</td>
                  <td className="p-4 text-blue-400">{c.telefone || '---'}</td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(c.data_cadastro).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}