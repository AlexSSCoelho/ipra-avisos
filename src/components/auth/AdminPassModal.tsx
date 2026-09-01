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
        setError('Senha incorreta. (Padrão inicial: 1234)');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header do Modal */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Alterar Dirigente do Culto</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          
          <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
            Apenas 1 obreiro dirige o culto por vez e tem acesso à leitura ao vivo dos avisos no Púlpito.
          </div>

          {/* Selecionar novo dirigente */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Selecione o Obreiro Dirigente:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {obreiros.map((ob) => {
                const isSelected = selectedObreiroId === ob.id;
                return (
                  <button
                    key={ob.id}
                    type="button"
                    onClick={() => setSelectedObreiroId(ob.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/60 text-white font-medium shadow-xs'
                        : 'border-slate-800/80 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ob.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight">{ob.nome}</div>
                        <div className="text-[10px] text-slate-400">
                          {getCargoLabel(ob.cargo)}
                        </div>
                      </div>
                    </div>
                    {isSelected && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senha */}
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
                placeholder="Digite a senha (padrão: 1234)"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
