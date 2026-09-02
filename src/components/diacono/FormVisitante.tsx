import React, { useState } from 'react';
import { Send, CheckCircle2, MapPin, Church as ChurchIcon } from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';

export const FormVisitante: React.FC = () => {
  const { adicionarAviso } = useAvisos();

  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState<'homem' | 'mulher' | 'casal' | 'crianca' | 'familia'>('homem');
  const [cidade, setCidade] = useState('');
  const [igreja, setIgreja] = useState('');
  const [observacao, setObservacao] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    adicionarAviso({
      tipo: 'visitante',
      visitante: {
        nome: nome.trim(),
        genero,
        cidade: cidade.trim() || 'Auriflama',
        igreja: igreja.trim() || 'Primeira Visita',
        observacao: observacao.trim() || undefined,
      },
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    setNome('');
    setCidade('');
    setIgreja('');
    setObservacao('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 w-full max-w-full overflow-hidden transition-surface">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            Visitante transmitido ao Púlpito com sucesso!
          </span>
        </div>
      )}

      {/* 1. Nome do Visitante */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Nome do Visitante ou Família: <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Irmão Roberto Silva e Família"
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 2. Gênero / Grupo (Segmentos com quebra responsiva) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Composição:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 no-swipe" data-no-swipe="true">
          {[
            { id: 'homem' as const, label: 'Homem' },
            { id: 'mulher' as const, label: 'Mulher' },
            { id: 'casal' as const, label: 'Casal' },
            { id: 'familia' as const, label: 'Família' },
            { id: 'crianca' as const, label: 'Jovem' },
          ].map((item) => {
            const isSelected = genero === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGenero(item.id)}
                className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-bold text-center transition-all truncate ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs font-black ring-1 ring-indigo-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cidade de Origem */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Cidade de Origem:</span>
        </label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Ex: Auriflama, Jales, Votuporanga, São Paulo..."
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 4. Igreja / Denominação */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <ChurchIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Igreja / Congregação de Origem:</span>
        </label>
        <input
          type="text"
          value={igreja}
          onChange={(e) => setIgreja(e.target.value)}
          placeholder="Ex: Primeira visita, IPRA Central, Assembleia de Deus..."
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 5. Acompanhante / Observação */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Observação ou Convidado de quem? (Opcional):
        </label>
        <input
          type="text"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex: Convidado do Pb. Marcos / Parente da irmã Neusa"
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Botão de Enviar */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span>Transmitir Visitante ao Púlpito</span>
      </button>
    </form>
  );
};
