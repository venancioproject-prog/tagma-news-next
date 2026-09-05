'use client';
import { useState } from 'react'
import Link from 'next/link'

export default function ContatoPage() {
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 shadow-sm font-sans">
        <div className="border-b-2 border-[#003311] pb-4 mb-8">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#d8561c]">
            Atendimento & Imprensa
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#001c06] mt-1">
            Fale Conosco / Contato
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Envie sugestões de pautas, correções, comunicados de imprensa ou dúvidas comerciais.
          </p>
        </div>

        {enviado ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            <h3 className="font-bold text-base mb-1">✓ Mensagem enviada com sucesso!</h3>
            <p>Agradecemos o seu contato. Nossa equipe editorial responderá o mais breve possível.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Seu Nome Completo
                </label>
                <input
                  required
                  type="text"
                  placeholder="Nome e Sobrenome"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:border-[#003311] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Seu E-mail
                </label>
                <input
                  required
                  type="email"
                  placeholder="email@exemplo.com"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:border-[#003311] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Assunto
              </label>
              <select className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm bg-white focus:border-[#003311] focus:outline-none">
                <option>Sugestão de Pauta / Notícia</option>
                <option>Correção de Informação</option>
                <option>Parceria Comercial / Publicidade</option>
                <option>Outros Assuntos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                required
                rows={5}
                placeholder="Descreva a sua mensagem em detalhes..."
                className="w-full border border-gray-300 rounded p-3 text-sm focus:border-[#003311] focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-[#003311] hover:bg-[#001c06] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all"
            >
              Enviar Mensagem →
            </button>
          </form>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>E-mail da Redação: <strong>redacao@tagmanews.com</strong></span>
          <Link href="/" className="text-[#003311] font-bold hover:underline">
            Voltar para Home →
          </Link>
        </div>
      </div>
    </main>
  )
}
