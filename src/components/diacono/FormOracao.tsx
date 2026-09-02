import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';
import type { CategoriaOracao } from '../../types';

const CATEGORIAS_ORACAO: { id: CategoriaOracao; label: string; desc: string }[] = [
  { id: 'saude', label: 'Saúde & Tratamento', desc: 'Enfermidades e cirurgias' },
  { id: 'familia', label: 'Família & Lar', desc: 'Casamento e filhos' },
  { id: 'causas', label: 'Trabalho & Causas', desc: 'Emprego e causas' },
  { id: 'espiritual', label: 'Vida Espiritual', desc: 'Libertação e fé' },
  { id: 'agradecimento', label: 'Ação de Graças', desc: 'Vitória alcançada' },
  { id: 'luto', label: 'Consolo no Luto', desc: 'Família enlutada' },
  { id: 'outro', label: 'Outro Motivo', desc: 'Pedido geral' },
];

export const FormOracao: React.FC = () => {
  const { adicionarAviso } = useAvisos();

  const [nomePessoa, setNomePessoa] = useState('');
  const [categoria, setCategoria] = useState<CategoriaOracao>('saude');
  const [motivo, setMotivo] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomePessoa.trim()) return;

    adicionarAviso({
      tipo: 'oracao',
      oracao: {
        nomePessoa: nomePessoa.trim(),
        categoria,
        motivo: motivo.trim() || undefined,
        urgente,
      },
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    setNomePessoa('');
    setMotivo('');
    setUrgente(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 w-full max-w-full overflow-hidden transition-surface">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            Pedido de oração transmitido ao Púlpito com sucesso!
          </span>
        </div>
      )}

      {/* 1. Nome da Pessoa ou Família */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Nome da Pessoa ou Família: <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={nomePessoa}
          onChange={(e) => setNomePessoa(e.target.value)}
          placeholder="Ex: Dona Antônia (Mãe da irmã Lúcia)"
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 2. Categoria do Pedido */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Motivo da Intercessão:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 no-swipe" data-no-swipe="true">
          {CATEGORIAS_ORACAO.map((cat) => {
            const isSelected = categoria === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all truncate ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200 font-bold shadow-xs ring-1 ring-amber-400/40'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-xs sm:text-sm font-bold leading-tight truncate">{cat.label}</div>
                <div className={`text-[11px] font-medium mt-0.5 truncate ${isSelected ? 'text-amber-800 dark:text-amber-300' : 'text-slate-400'}`}>
                  {cat.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detalhes */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Detalhes do Pedido:
        </label>
        <textarea
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: Realizará exames na Santa Casa nesta semana. Pedem a oração de toda a igreja."
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 4. Destaque / Urgência */}
      <div className={`border rounded-2xl p-3.5 transition-all ${
        urgente 
          ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 ring-1 ring-rose-400/30' 
          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
      }`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={urgente}
            onChange={(e) => setUrgente(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-rose-600 focus:ring-rose-500 shrink-0"
          />
          <div>
            <div className={`text-sm font-bold flex items-center gap-2 ${urgente ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'}`}>
              <span>Orar com prioridade no Púlpito</span>
              {urgente && <span className="px-2 py-0.5 rounded text-[9px] bg-rose-600 text-white font-extrabold uppercase tracking-wide">Urgente</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
              Sinaliza este pedido com destaque visual no momento de oração congregacional.
            </p>
          </div>
        </label>
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm sm:text-base shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span>Transmitir Pedido de Oração</span>
      </button>
    </form>
  );
};
