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
  const [dataEvento, setDataEvento] = useState('');
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
        descricao: descricao.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 w-full max-w-full overflow-hidden transition-surface">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            Comunicado transmitido ao Púlpito com sucesso!
          </span>
        </div>
      )}

      {/* 1. Assunto / Título do Aviso */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>Assunto do Comunicado: <span className="text-rose-500">*</span></span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5 no-swipe" data-no-swipe="true">
          {SUGESTOES_TITULO.map((t) => {
            const isSelected = titulo === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTitulo(t)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:border-slate-300'
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
            className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white mt-2 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        )}
      </div>

      {/* 2. Destinatário */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>Público / Destinatário:</span>
        </label>
        <div className="flex flex-wrap gap-1.5 no-swipe" data-no-swipe="true">
          {DESTINATARIOS.map((d) => {
            const isSelected = destinatario === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDestinatario(d)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:border-slate-300'
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
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Informações Detalhadas:
        </label>
        <textarea
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Convidamos todos os irmãos para a cantina após o culto em prol das atividades da mocidade."
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 4. Data do Evento */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>Data de Realização / Validade (Opcional):</span>
        </label>
        <input
          type="text"
          value={dataEvento}
          onChange={(e) => setDataEvento(e.target.value)}
          placeholder="Ex: Próximo Domingo pela manhã"
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span>Transmitir Comunicado Geral</span>
      </button>
    </form>
  );
};
