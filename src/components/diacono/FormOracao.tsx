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
        motivo: motivo.trim() || 'Pedido de oração e intercessão.',
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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3.5 w-full max-w-full overflow-hidden">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">
            Pedido de oração transmitido ao Púlpito com sucesso.
          </span>
        </div>
      )}

      {/* 1. Nome da Pessoa ou Família */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Nome da Pessoa ou Família: <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={nomePessoa}
          onChange={(e) => setNomePessoa(e.target.value)}
          placeholder="Ex: Dona Antônia (Mãe da irmã Lúcia)"
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 dark:focus:border-amber-400 focus:outline-none transition-colors"
        />
      </div>

      {/* 2. Categoria do Pedido */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Motivo da Intercessão:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {CATEGORIAS_ORACAO.map((cat) => {
            const isSelected = categoria === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all truncate ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="text-[11px] sm:text-xs font-semibold leading-tight truncate">{cat.label}</div>
                <div className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {cat.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detalhes */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Detalhes do Pedido:
        </label>
        <textarea
          rows={2}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: Realizará exames na Santa Casa nesta semana. Pedem a oração de toda a igreja."
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* 4. Destaque / Urgência */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={urgente}
            onChange={(e) => setUrgente(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 focus:ring-amber-500 shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Orar com prioridade no Púlpito
            </div>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Sinaliza este pedido com destaque visual no momento de oração congregacional.
            </p>
          </div>
        </label>
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4 shrink-0" />
        <span>Transmitir Pedido de Oração</span>
      </button>
    </form>
  );
};
