'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PDV() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro')
  const [cpfCliente, setCpfCliente] = useState('')
  const [temaEscuro, setTemaEscuro] = useState(true)
  
  // Estados para o Histórico
  const [vendasRecentes, setVendasRecentes] = useState<any[]>([])
  const [exibirHistorico, setExibirHistorico] = useState(false)

  useEffect(() => {
    carregarDados()
    const temaSalvo = localStorage.getItem('gsa-tema-escuro')
    if (temaSalvo !== null) setTemaEscuro(temaSalvo === 'true')
  }, [])

  async function carregarDados() {
    const { data: p } = await supabase.from('produtos').select('*').order('nome')
    const { data: v } = await supabase.from('vendas').select('*').order('data_venda', { ascending: false }).limit(20)
    if (p) setProdutos(p)
    if (v) setVendasRecentes(v)
  }

  const total = carrinho.reduce((acc, item) => acc + Number(item.preco_venda), 0)

  // FUNÇÃO MESTRA DE IMPRESSÃO (Pode ser chamada para qualquer venda do histórico)
  const imprimirCupomGSA = (venda: any) => {
    const win = window.open('', '', 'width=300,height=600')
    if (!win) return

    // Ajuste para lidar com o formato que vem do banco (itens_vendidos) ou do estado local (itens)
    const itensParaImprimir = venda.itens_vendidos || venda.itens

    const itensHtml = itensParaImprimir.map((i: any) => `
      <tr>
        <td style="padding: 2px 0;">${i.nome.toUpperCase().slice(0, 20)}</td>
        <td align="right">1</td>
        <td align="right">${Number(i.preco_venda).toFixed(2)}</td>
      </tr>
    `).join('')

    win.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; width: 72mm; font-size: 11px; margin: 0; padding: 10px; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .dashed { border-bottom: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-size: 14px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center"><strong>GOMES SERVIÇOS ÁGEIS</strong></div>
          <div class="dashed"></div>
          <div>DATA: ${new Date(venda.data_venda || new Date()).toLocaleString('pt-BR')}</div>
          <div>CPF: ${venda.cpf_cliente || venda.cpf || 'CONSUMIDOR'}</div>
          <div class="dashed"></div>
          <table>
            <tr><th align="left">ITEM</th><th align="right">QD</th><th align="right">VL</th></tr>
            ${itensHtml}
          </table>
          <div class="dashed"></div>
          <div class="total">TOTAL: R$ ${Number(venda.total_venda || venda.total).toFixed(2)}</div>
          <div>FORMA: ${(venda.metodo_pagamento || venda.pagamento).toUpperCase()}</div>
          <div class="dashed"></div>
          <div class="center">*** REIMPRESSÃO DE VENDA ***</div>
        </body>
      </html>
    `)
    win.document.close()
  }

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return
    setLoading(true)

    const dadosVenda = {
      total_venda: total,
      itens_vendidos: carrinho,
      metodo_pagamento: metodoPagamento,
      cpf_cliente: cpfCliente || 'Não informado'
    }

    try {
      const { error } = await supabase.from('vendas').insert([dadosVenda])
      if (error) throw error

      for (const item of carrinho) {
        await supabase.from('produtos').update({ estoque_atual: item.estoque_atual - 1 }).eq('id', item.id)
      }

      imprimirCupomGSA(dadosVenda)
      setCarrinho([])
      setCpfCliente('')
      carregarDados()
      alert("Venda Finalizada!")
    } catch (err) {
      alert("Erro ao salvar venda.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`flex h-screen p-4 gap-4 transition-colors duration-500 overflow-hidden font-sans ${temaEscuro ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Lado Esquerdo: Navegação e Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <header className={`p-4 rounded-2xl flex items-center gap-4 ${temaEscuro ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-sm border border-gray-200'}`}>
          <input 
            type="text" 
            placeholder="🔍 BUSCAR PRODUTO..." 
            className={`flex-1 p-2 rounded-lg outline-none font-bold ${temaEscuro ? 'bg-gray-800' : 'bg-gray-100'}`}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button 
            onClick={() => setExibirHistorico(!exibirHistorico)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase border transition-all ${exibirHistorico ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-gray-600 text-gray-400'}`}
          >
            📋 Histórico
          </button>
          <button onClick={() => setTemaEscuro(!temaEscuro)} className="p-2">{temaEscuro ? '☀️' : '🌙'}</button>
          <Link href="/" className="p-2 px-4 rounded-xl bg-gray-500 text-white font-bold text-xs">SAIR</Link>
        </header>

        <div className={`flex-1 rounded-3xl p-6 overflow-y-auto grid grid-cols-2 lg:grid-cols-4 gap-4 content-start ${temaEscuro ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
          {produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map(p => (
            <button 
              key={p.id} 
              onClick={() => {
                if (p.estoque_atual > 0) setCarrinho([...carrinho, { ...p, uuid_carrinho: crypto.randomUUID() }])
                else alert("Estoque zerado!")
              }}
              className={`p-4 rounded-2xl text-left border transition-all active:scale-95 ${temaEscuro ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-blue-600 shadow-sm'}`}
            >
              <div className="text-[9px] font-black text-gray-500 uppercase">{p.codigo_interno}</div>
              <div className="font-bold text-sm h-10 overflow-hidden uppercase mt-1">{p.nome}</div>
              <div className="mt-2 font-black text-xl text-blue-500">R$ {Number(p.preco_venda).toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lado Direito: Checkout OU Histórico */}
      <div className={`w-[400px] rounded-3xl flex flex-col shadow-2xl overflow-hidden transition-all ${temaEscuro ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        
        {exibirHistorico ? (
          /* TELA DE HISTÓRICO */
          <div className="flex flex-col h-full">
            <div className="p-6 bg-gray-800 text-white flex justify-between items-center">
              <h2 className="font-black uppercase italic">Vendas Recentes</h2>
              <button onClick={() => setExibirHistorico(false)} className="text-xs bg-gray-700 px-2 py-1 rounded">Fechar</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {vendasRecentes.map((v) => (
                <div key={v.id} className={`p-3 rounded-xl border flex justify-between items-center ${temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400">{new Date(v.data_venda).toLocaleTimeString()}</div>
                    <div className="font-black text-blue-500">R$ {Number(v.total_venda).toFixed(2)}</div>
                    <div className="text-[9px] uppercase">{v.metodo_pagamento}</div>
                  </div>
                  <button 
                    onClick={() => imprimirCupomGSA(v)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-[10px] font-black hover:bg-blue-700"
                  >
                    REIMPRIMIR
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* TELA DE CHECKOUT (CARRINHO) */
          <div className="flex flex-col h-full text-black">
            <div className="p-6 bg-blue-600 text-white">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Checkout GSA</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {carrinho.map((item) => (
                <div key={item.uuid_carrinho} className={`flex justify-between items-center p-3 rounded-xl ${temaEscuro ? 'bg-gray-800/50 text-white' : 'bg-gray-50'}`}>
                  <div className="text-xs font-bold uppercase w-40 truncate">{item.nome}</div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-blue-500">R$ {Number(item.preco_venda).toFixed(2)}</span>
                    <button onClick={() => setCarrinho(carrinho.filter(i => i.uuid_carrinho !== item.uuid_carrinho))} className="text-red-500 font-bold p-1">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-6 border-t ${temaEscuro ? 'border-gray-800 bg-gray-950 text-white' : 'border-gray-100 bg-gray-50'}`}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['Dinheiro', 'Pix', 'Cartão'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setMetodoPagamento(m)}
                    className={`p-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${metodoPagamento === m ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-300 text-gray-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                value={cpfCliente} 
                onChange={e => setCpfCliente(e.target.value)} 
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none mb-4 ${temaEscuro ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-black'}`} 
                placeholder="CPF CLIENTE" 
              />
              <div className="flex justify-between items-end mb-6">
                <span className="font-black text-[10px] text-gray-400 uppercase">Total</span>
                <span className={`text-4xl font-black ${temaEscuro ? 'text-blue-400' : 'text-blue-600'}`}>R$ {total.toFixed(2)}</span>
              </div>
              <button 
                onClick={finalizarVenda}
                disabled={loading || carrinho.length === 0}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl ${loading || carrinho.length === 0 ? 'bg-gray-300 text-gray-500' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {loading ? 'GRAVANDO...' : 'FINALIZAR VENDA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}