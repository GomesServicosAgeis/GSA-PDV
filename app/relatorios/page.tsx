'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Relatorios() {
  const [vendas, setVendas] = useState<any[]>([])
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function carregarDados() {
    setLoading(true)
    
    // 1. Buscar todas as vendas
    const { data: dataVendas } = await supabase
      .from('vendas')
      .select('*')
      .order('data_venda', { ascending: false })

    // 2. Buscar produtos com estoque baixo (menos de 5 unidades)
    const { data: dataEstoque } = await supabase
      .from('produtos')
      .select('*')
      .lt('estoque_atual', 5)

    if (dataVendas) setVendas(dataVendas)
    if (dataEstoque) setProdutosBaixoEstoque(dataEstoque)
    setLoading(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Calcular total vendido
  const faturamentoTotal = vendas.reduce((acc, v) => acc + Number(v.total_venda), 0)

  if (loading) return <div className="p-10 text-center font-bold">Carregando Relatórios GSA...</div>

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10 text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-blue-600">GSA PDV - Inteligência</h1>
          <Link href="/pdv" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">
            Voltar ao Caixa
          </Link>
        </div>

        {/* Alerta de Estoque Baixo */}
        {produtosBaixoEstoque.length > 0 && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
            <h2 className="text-amber-800 font-bold flex items-center gap-2">
              ⚠️ ATENÇÃO: ESTOQUE CRÍTICO
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {produtosBaixoEstoque.map(p => (
                <span key={p.id} className="bg-white px-3 py-1 rounded-full text-xs border border-amber-200 font-medium">
                  {p.nome}: <span className="text-red-600 font-bold">{p.estoque_atual} un</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Faturamento Total</p>
            <p className="text-4xl font-black text-green-600">R$ {faturamentoTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total de Vendas</p>
            <p className="text-4xl font-black text-blue-600">{vendas.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Média por Venda</p>
            <p className="text-4xl font-black text-gray-800">
              R$ {vendas.length > 0 ? (faturamentoTotal / vendas.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Tabela de Vendas Recentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-bold">Histórico de Vendas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Itens</th>
                  <th className="px-6 py-4">Pagamento</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      {new Date(v.data_venda).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {v.itens_vendidos.length} item(ns)
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                        {v.metodo_pagamento}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      R$ {Number(v.total_venda).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}