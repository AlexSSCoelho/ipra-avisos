import React, { useState } from 'react';
import { Church, X, Clock, Crown, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { getCargoLabel } from '../../utils/formatters';

interface IniciarCultoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SUGESTOES_CULTO = [
  'Culto da Família & Celebração',
  'Culto de Doutrina & Estudo Bíblico',
  'Culto de Oração & Clamor',
  'Culto de Jovens & Mocidade (UMERP)',
  'Santa Ceia do Senhor',
  'Culto de Missões & Evangelismo',
  'Vigília de Oração',
  'Outro Culto',
];

export const IniciarCultoModal: React.FC<IniciarCultoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { obreiros, currentUser } = useAuth();
  const { iniciarNovoCulto } = useCulto();

  const [nomeCultoPreset, setNomeCultoPreset] = useState(SUGESTOES_CULTO[0]);
  const [nomeCultoPersonalizado, setNomeCultoPersonalizado] = useState('');
  const [selectedDirigenteId, setSelectedDirigenteId] = useState<string>(
    currentUser?.id || (obreiros[0] ? obreiros[0].id : '')
  );
  const [horario, setHorario] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleIniciar = (e: React.FormEvent) => {
    e.preventDefault();

    const nomeFinal =
      nomeCultoPreset === 'Outro Culto'
        ? nomeCultoPersonalizado.trim() || 'Culto de Celebração'
        : nomeCultoPreset;

    const dirigente = obreiros.find((o) => o.id === selectedDirigenteId) || currentUser || obreiros[0];

    if (!dirigente) return;

    iniciarNovoCulto(nomeFinal, dirigente);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header do Modal */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Church className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Iniciar Novo Culto</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <form onSubmit={handleIniciar} className="p-5 space-y-4 overflow-y-auto">
          <div className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
            Ao iniciar um novo culto, a lista de leitura no Púlpito é renovada e os registros anteriores permanecem preservados no Histórico.
          </div>

          {/* 1. Nome do Culto */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tipo de Culto:</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2 no-swipe" data-no-swipe="true">
              {SUGESTOES_CULTO.map((item) => {
                const isSelected = nomeCultoPreset === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNomeCultoPreset(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all truncate ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold border-transparent shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {nomeCultoPreset === 'Outro Culto' && (
              <input
                type="text"
                required
                value={nomeCultoPersonalizado}
                onChange={(e) => setNomeCultoPersonalizado(e.target.value)}
                placeholder="Digite o título do culto especial"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 mt-1 transition-all"
              />
            )}
          </div>

          {/* 2. Seleção do Dirigente */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Dirigente no Púlpito:</span>
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 border border-slate-800 rounded-2xl p-1.5 bg-slate-950/60 no-swipe shadow-inner" data-no-swipe="true">
              {obreiros.map((ob) => {
                const isSelected = selectedDirigenteId === ob.id;
                return (
                  <button
                    key={ob.id}
                    type="button"
                    onClick={() => setSelectedDirigenteId(ob.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/70 text-white font-semibold shadow-xs ring-1 ring-amber-500/30'
                        : 'border-transparent hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ob.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white leading-tight truncate">
                          {ob.nome}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {getCargoLabel(ob.cargo)}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Horário de Início */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Horário Previsto de Início:</span>
            </label>
            <input
              type="text"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Ex: 19:30"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>

          {showSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Novo culto aberto com sucesso!</span>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2.5 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-black rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 touch-target"
            >
              <Church className="w-4 h-4 font-bold" />
              <span>Abrir Sessão do Culto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};