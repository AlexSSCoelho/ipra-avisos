import React, { useState } from 'react';
import { Send, CheckCircle2, Tag, Calendar, Users } from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';

const SUGESTOES_TITULO = [
  'Santa Ceia do Senhor',
  'Cantina da Juventude',
  'Batismo nas Águas',
  'Vigília de Oração',
  'Consagração & Jejum',
  'Escala de Limpeza & Cantina',
  'Outro Assunto',
];

const DESTINATARIOS = [
  'Toda a Igreja',
  'Liderança & Obreiros',
  'Grupo de Varões',
  'Círculo de Oração',
  'Juventude & Mocidade',
  'Famílias',
];

export const FormAvisoGeral: React.FC = () => {
  const { adicionarAviso } = useAvisos();

  const [titulo, setTitulo] = useState('Santa Ceia do Senhor');
  const [tituloPersonalizado, setTituloPersonalizado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataEvento, setDataEvento] = useState('Próximo Domingo');
  const [destinatario, setDestinatario] = useState('Toda a Igreja');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tituloFinal = titulo === 'Outro Assunto' ? tituloPersonalizado.trim() || 'Aviso da Igreja' : titulo;
    if (!tituloFinal) return;

    adicionarAviso({
      tipo: 'geral',
      geral: {
        titulo: tituloFinal,
        descricao: descricao.trim() || 'Aviso comunicado à igreja.',
        dataEvento: dataEvento.trim() || undefined,
        destinatario: destinatario.trim() || 'Toda a Igreja',
      },
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    setDescricao('');
    setTituloPersonalizado('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">
            Comunicado transmitido ao Púlpito com sucesso.
          </span>
        </div>
      )}

      {/* 1. Assunto / Título do Aviso */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <span>Assunto do Comunicado: <span className="text-rose-500">*</span></span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {SUGESTOES_TITULO.map((t) => {
            const isSelected = titulo === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTitulo(t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {titulo === 'Outro Assunto' && (
          <input
            type="text"
            required
            value={tituloPersonalizado}
            onChange={(e) => setTituloPersonalizado(e.target.value)}
            placeholder="Digite o título do comunicado"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 mt-1"
          />
        )}
      </div>

      {/* 2. Destinatário */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>Público / Destinatário:</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DESTINATARIOS.map((d) => {
            const isSelected = destinatario === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDestinatario(d)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detalhes */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Informações Detalhadas:
        </label>
        <textarea
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Convidamos todos os irmãos para a cantina após o culto em prol das atividades da mocidade."
          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* 4. Data do Evento */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Data de Realização / Validade:</span>
        </label>
        <input
          type="text"
          value={dataEvento}
          onChange={(e) => setDataEvento(e.target.value)}
          placeholder="Ex: Próximo Domingo pela manhã"
          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] text-white dark:text-slate-950 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4" />
        <span>Transmitir Comunicado Geral</span>
      </button>
    </form>
  );
};
