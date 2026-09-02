import React, { useState } from 'react';
import { 
  Church, 
  ArrowRight, 
  KeyRound,
  Check,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import type { Obreiro } from '../../types';
import { getCargoLabel } from '../../utils/formatters';

interface LoginScreenProps {
  onSuccess: (isDirigente?: boolean, obreiro?: Obreiro) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { obreiros, login, verifyObreiroPin } = useAuth();
  const { cultoAtivo, definirDirigente } = useCulto();

  const [selectedObreiro, setSelectedObreiro] = useState<Obreiro | null>(obreiros[0] || null);
  const [isDirigindoCulto, setIsDirigindoCulto] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isSelectedAlreadyDirigente = Boolean(
    selectedObreiro &&
      cultoAtivo &&
      cultoAtivo.status === 'em_andamento' &&
      cultoAtivo.dirigenteId === selectedObreiro.id
  );

  const handleEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedObreiro) {
      setErrorMsg('Selecione seu nome na lista para prosseguir.');
      return;
    }

    if (!pin || pin.trim().length === 0) {
      setErrorMsg('Informe sua senha para entrar (senha padrão: 1234).');
      return;
    }

    const isValidPin = verifyObreiroPin(selectedObreiro.id, pin);
    if (!isValidPin) {
      setErrorMsg('Senha incorreta. Se ainda não alterou sua senha, utilize a senha padrão 1234.');
      return;
    }

    const isAlreadyDirigente = Boolean(
      cultoAtivo &&
        cultoAtivo.status === 'em_andamento' &&
        cultoAtivo.dirigenteId === selectedObreiro.id
    );

    if (isDirigindoCulto && !isAlreadyDirigente) {
      const result = definirDirigente(selectedObreiro, pin);
      if (!result.success) {
        setErrorMsg(result.message || 'Não foi possível assumir a direção do culto.');
        return;
      }
    }

    login(selectedObreiro);
    onSuccess(isDirigindoCulto || isAlreadyDirigente, selectedObreiro);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-amber-500 selection:text-black">
      {/* Barra Superior Discreta */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between py-2 text-xs">
        <span className="text-amber-400 font-bold tracking-wider text-[11px] uppercase">
          IPRA Avisos
        </span>
        <span className="text-slate-500 text-[11px] tracking-wide uppercase font-medium">
          Auriflama • SP
        </span>
      </div>

      {/* Cartão Principal */}
      <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 my-auto">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Church className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            IPRA Auriflama
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Selecione seu nome e digite sua senha para entrar
          </p>
        </div>

        <form onSubmit={handleEntrar} className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span className="uppercase tracking-wider text-[10px]">Identificação do Obreiro:</span>
              <span className="text-slate-500 font-medium">{obreiros.length} obreiros</span>
            </div>
            
            <div 
              className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-2xl p-1.5 bg-slate-950/70 no-swipe shadow-inner" 
              data-no-swipe="true"
            >
              {obreiros.map((ob) => {
                const isSelected = selectedObreiro?.id === ob.id;
                const isDirigenteDoCulto = cultoAtivo?.dirigenteId === ob.id;

                return (
                  <button
                    key={ob.id}
                    type="button"
                    onClick={() => {
                      setSelectedObreiro(ob);
                      setErrorMsg('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-800/95 border-amber-500/80 text-white font-semibold shadow-sm ring-1 ring-amber-500/40'
                        : 'bg-transparent border-transparent hover:bg-slate-850/60 text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ob.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                          {ob.nome}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {getCargoLabel(ob.cargo)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDirigenteDoCulto && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 uppercase tracking-wide">
                          <Crown className="w-2.5 h-2.5 text-amber-400" /> Dirigente
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Senha de Acesso:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Padrão: <strong className="text-amber-400 font-bold">1234</strong>
              </span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Digite sua senha (padrão: 1234)"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Todos os membros iniciam com a senha <strong className="text-slate-400">1234</strong>. Você pode alterá-la em Ajustes.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDirigindoCulto}
                onChange={(e) => setIsDirigindoCulto(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estou dirigindo o culto de hoje</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5 font-normal">
                  Assume a direção da sessão para receber avisos prioritários no Púlpito.
                </p>
              </div>
            </label>

            {isDirigindoCulto && isSelectedAlreadyDirigente && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5 mt-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Você já está registrado como dirigente ativo desta sessão.</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium animate-in fade-in duration-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all touch-target"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4 font-bold" />
          </button>
        </form>
      </div>

      <div className="max-w-md mx-auto w-full text-center text-[11px] text-slate-500 py-2">
        Igreja Presbiteriana Renovada • Auriflama / SP
      </div>
    </div>
  );
};
