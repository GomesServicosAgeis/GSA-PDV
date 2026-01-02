'use client'
export default function Bloqueado() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <div className="bg-red-900/20 p-10 rounded-[3rem] border border-red-500/30 text-center max-w-lg">
        <span className="text-6xl mb-6 block">🔒</span>
        <h1 className="text-3xl font-black mb-4">ASSINATURA EXPIRADA</h1>
        <p className="text-gray-400 font-bold mb-8">
          Sua licença do GSA PDV venceu. Para continuar operando seu negócio com agilidade, entre em contato com o suporte.
        </p>
        <button className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">
          RENOVAR VIA WHATSAPP
        </button>
      </div>
    </main>
  )
}