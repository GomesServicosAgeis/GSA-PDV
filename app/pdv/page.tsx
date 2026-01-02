'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PDV() {
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const inputBusca = useRef<HTMLInputElement>(null)

  // Carrega produtos para busca rápida
  useEffect(() => {
    const buscarDados = async () => {
      const { data } = await supabase.from('produtos').select('*')
      if (data) setProdutos(data)
    }
    buscarDados()
  }, [])

  const adicionarAoCarrinho = (produto: any) => {
    const itemExistente = carrinho.find(item => item.id === produto.id)
    if (itemExistente && produto.tipo === 'PRODUTO') {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
      ))
    } else {
      setCarrinho([...carrinho, { ...produto, qtd: 1 }])
    }
    setBusca('')
    inputBusca.current?.focus()
  }

  const removerItem = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index))
  }

  const total = carrinho.reduce((acc, item) => acc + (item.preco_venda * item.qtd), 0)

  async function finalizarVenda() {
    if (carrinho.length === 0) return alert("Carrinho vazio!")
    
    // Aqui no futuro inserimos na tabela 'vendas' e 'itens_venda'
    // E fazemos o update do estoque para itens do tipo 'PRODUTO'
    alert("Venda Simulada com Sucesso! Total: R$ " + total.toFixed(2))
    setCarrinho([])
  }

  const resultadosBusca = busca.length > 1 
    ? produtos.filter(p => p.nome.includes(busca.toUpperCase()) || p.codigo_ean.includes(busca))
    : []

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Busca e Itens */}
        <div className="lg:col-span-2 space-y-6">
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">GSA PDV</h1>
            <Link href="/cadastro" className="text-[10px] font-black text-blue-500 uppercase">Gerenciar Estoque</Link>
          </header>

          <div className="relative">
            <input 
              ref={inputBusca}
              className="w-full bg-gray-900 p-6 rounded-3xl border-2 border-blue-500/30 focus:border-blue-500 outline-none text-2xl font-bold uppercase"
              placeholder="Digite o nome ou bipe o código..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              autoFocus
            />
            {resultadosBusca.length > 0 && (
              <div className="absolute w-full bg-gray-900 mt-2 rounded-3xl border border-gray-800 shadow-2xl z-50 overflow-hidden">
                {resultadosBusca.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => adicionarAoCarrinho(p)}
                    className="p-4 hover:bg-blue-600 cursor-pointer flex justify-between items-center border-b border-gray-800"
                  >
                    <span>{p.tipo === 'SERVICO' ? '🛠️' : '📦'} {p.nome}</span>
                    <span className="font-black text-emerald-400">R$ {p.preco_venda.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900/40 rounded-[2.5rem] border border-gray-800 overflow-hidden min-h-[400px]">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 text-gray-500 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-6">Item</th>
                  <th className="p-6">Qtd</th>
                  <th className="p-6">Subtotal</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="font-bold uppercase text-sm">
                {carrinho.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="p-6">{item.nome}</td>
                    <td className="p-6">{item.qtd}x</td>
                    <td className="p-6 text-emerald-500">R$ {(item.preco_venda * item.qtd).toFixed(2)}</td>
                    <td className="p-6 text-right"><button onClick={() => removerItem(index)} className="text-red-500 text-[10px]">REMOVER</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Direito: Checkout */}
        <div className="bg-blue-600 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl shadow-blue-500/20">
          <div>
            <span className="text-[10px] font-black uppercase opacity-60">Total da Venda</span>
            <div className="text-6xl font-black italic tracking-tighter mt-2">
              R$ {total.toFixed(2)}
            </div>
            <div className="mt-10 space-y-4 text-[10px] font-black uppercase">
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span>Itens no Carrinho</span>
                <span>{carrinho.length}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={finalizarVenda}
            className="w-full bg-white text-blue-600 p-8 rounded-3xl font-black uppercase text-xl hover:scale-105 transition-transform"
          >
            Finalizar (F12)
          </button>
        </div>

      </div>
    </main>
  )
}