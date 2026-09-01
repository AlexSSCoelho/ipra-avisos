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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3.5 w-full max-w-full overflow-hidden">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">
            Visitante transmitido ao Púlpito com sucesso.
          </span>
        </div>
      )}

      {/* 1. Nome do Visitante */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Nome do Visitante ou Família: <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Irmão Roberto Silva e Família"
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 dark:focus:border-amber-400 focus:outline-none transition-colors"
        />
      </div>

      {/* 2. Gênero / Grupo (Segmentos com quebra responsiva) */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Composição:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
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
                className={`py-1.5 px-1 rounded-lg text-xs font-medium text-center transition-all truncate ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cidade de Origem (Campo Totalmente Digitável) */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Cidade de Origem:</span>
        </label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Ex: Auriflama, Jales, Votuporanga, São Paulo..."
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 dark:focus:border-amber-400 focus:outline-none transition-colors"
        />
      </div>

      {/* 4. Igreja / Denominação (Campo Totalmente Digitável) */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
          <ChurchIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Igreja / Congregação de Origem:</span>
        </label>
        <input
          type="text"
          value={igreja}
          onChange={(e) => setIgreja(e.target.value)}
          placeholder="Ex: Primeira visita, IPRA Central, Assembleia de Deus..."
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 dark:focus:border-amber-400 focus:outline-none transition-colors"
        />
      </div>

      {/* 5. Acompanhante / Observação */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Observação ou Convidado de quem? (Opcional):
        </label>
        <input
          type="text"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex: Convidado do Pb. Marcos / Parente da irmã Neusa"
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* Botão de Enviar */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4 shrink-0" />
        <span>Transmitir Visitante ao Púlpito</span>
      </button>
    </form>
  );
};
