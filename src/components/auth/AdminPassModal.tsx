import React, { useState } from 'react';
import { ShieldCheck, X, Crown, UserCheck, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { getCargoLabel } from '../../utils/formatters';

interface AdminPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType?: 'trocar_dirigente' | 'admin_geral';
}

export const AdminPassModal: React.FC<AdminPassModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { obreiros, verifyAdminPin, isAdmin } = useAuth();
  const { cultoAtivo, definirDirigente } = useCulto();

  const [pin, setPin] = useState('');
  const [selectedObreiroId, setSelectedObreiroId] = useState(cultoAtivo?.dirigenteId || '');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetObreiro = obreiros.find((o) => o.id === selectedObreiroId);
    if (!targetObreiro) {
      setError('Selecione um obreiro válido na lista.');
      return;
    }

    // Se for Admin, autoriza direto; se for outro cargo, valida o PIN
    if (!isAdmin) {
      if (!pin) {
        setError('Por favor, digite a senha de autorização.');
        return;
      }

      if (!verifyAdminPin(pin)) {
        setError('Senha administrativa incorreta.');
        return;
      }
    }

    const result = definirDirigente(targetObreiro, pin || undefined);
    if (result.success) {
      setSuccessMsg(`Direção do culto transferida para ${targetObreiro.nome}.`);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setPin('');
      }, 1000);
    } else {
      setError(result.message || 'Erro ao alterar dirigente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header do Modal */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Alterar Dirigente do Culto</h3>
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
        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          
          <div className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
            Apenas 1 obreiro dirige o culto por vez e tem acesso à leitura ao vivo dos avisos no Púlpito.
          </div>

          {/* Selecionar novo dirigente */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Selecione o Obreiro Dirigente:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-slate-800 rounded-2xl p-1.5 bg-slate-950/60 no-swipe shadow-inner" data-no-swipe="true">
              {obreiros.map((ob) => {
                const isSelected = selectedObreiroId === ob.id;
                return (
                  <button
                    key={ob.id}
                    type="button"
                    onClick={() => setSelectedObreiroId(ob.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/70 text-white font-semibold shadow-xs ring-1 ring-amber-500/30'
                        : 'border-transparent hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ob.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">{ob.nome}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {getCargoLabel(ob.cargo)}
                        </div>
                      </div>
                    </div>
                    {isSelected && <UserCheck className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senha */}
          {!isAdmin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Senha de Autorização:
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Digite a senha administrativa"
                  className="w-full pl-8.5 pr-3 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-black rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all touch-target"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
