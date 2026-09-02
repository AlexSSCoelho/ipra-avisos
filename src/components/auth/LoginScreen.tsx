import React, { useState } from 'react';
import { 
  Church, 
  ArrowRight, 
  KeyRound,
  Check,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import type { Obreiro, CargoObreiro } from '../../types';
import { getCargoLabel } from '../../utils/formatters';

interface LoginScreenProps {
  onSuccess: (isDirigente?: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { obreiros, login, isBootstrap, bootstrapInitialAdmin } = useAuth();
  const { cultoAtivo, definirDirigente } = useCulto();
  const { fontScale, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  // --- Identificação normal ---
  const [selectedObreiro, setSelectedObreiro] = useState<Obreiro | null>(obreiros[0] || null);
  const [isDirigindoCulto, setIsDirigindoCulto] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- Bootstrap: primeira configuração ---
  const [bootstrapStep, setBootstrapStep] = useState<'form' | 'pin'>('form');
  const [bootstrapNome, setBootstrapNome] = useState('');
  const [bootstrapCargo, setBootstrapCargo] = useState<CargoObreiro>('pastor');
  const [bootstrapGenero, setBootstrapGenero] = useState<'homem' | 'mulher'>('homem');
  const [bootstrapPin, setBootstrapPin] = useState('');
  const [bootstrapPinConfirm, setBootstrapPinConfirm] = useState('');
  const [bootstrapError, setBootstrapError] = useState('');

  // ──────────────────────────────────────────────
  // FLUXO DE BOOTSTRAP
  // ──────────────────────────────────────────────
  const handleBootstrapContinuar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bootstrapNome.trim()) {
      setBootstrapError('Informe o nome do administrador.');
      return;
    }
    setBootstrapError('');
    setBootstrapStep('pin');
  };

  const handleBootstrapConcluir = (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapError('');
    if (!bootstrapPin || bootstrapPin.trim().length < 4) {
      setBootstrapError('O PIN deve ter pelo menos 4 dígitos.');
      return;
    }
    if (bootstrapPin !== bootstrapPinConfirm) {
      setBootstrapError('Os PINs não coincidem.');
      return;
    }

    const result = bootstrapInitialAdmin(
      {
        nome: bootstrapNome.trim(),
        cargo: bootstrapCargo,
        genero: bootstrapGenero,
      },
      bootstrapPin
    );

    if (!result.success) {
      setBootstrapError(result.message || 'Erro ao criar administrador.');
      return;
    }

    onSuccess(false);
  };

  // ──────────────────────────────────────────────
  // FLUXO NORMAL DE IDENTIFICAÇÃO
  // ──────────────────────────────────────────────
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

    const isAlreadyDirigente = Boolean(
      cultoAtivo &&
        cultoAtivo.status === 'em_andamento' &&
        cultoAtivo.dirigenteId === selectedObreiro.id
    );

    if (isDirigindoCulto) {
      if (!isAlreadyDirigente) {
        if (!pin || pin.trim().length === 0) {
          setErrorMsg('Informe a senha administrativa para assumir a direção do culto.');
          return;
        }
      }

      const result = definirDirigente(selectedObreiro, pin || undefined);
      if (!result.success) {
        setErrorMsg(result.message || 'Senha incorreta para assumir a direção do culto.');
        return;
      }
    }

    login(selectedObreiro);
    onSuccess(isDirigindoCulto || isAlreadyDirigente);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-amber-500 selection:text-black">
      
      {/* Barra Superior Discreta */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between py-2 text-xs">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <span className="text-slate-400 text-[11px] px-1.5">Fonte:</span>
          <button
            onClick={decreaseFontSize}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs"
          >
            A⁻
          </button>
          <button
            onClick={resetFontSize}
            className="px-1 text-[11px] text-amber-300 font-semibold"
          >
            {Math.round(fontScale * 100)}%
          </button>
          <button
            onClick={increaseFontSize}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center justify-center text-xs"
          >
            A⁺
          </button>
        </div>

        <span className="text-slate-500 text-[11px] tracking-wide uppercase font-medium">
          Auriflama • SP
        </span>
      </div>

      {/* Cartão Principal */}
      <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 my-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            {isBootstrap ? <ShieldCheck className="w-6 h-6" /> : <Church className="w-6 h-6" />}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            IPRA Auriflama
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBootstrap ? 'Primeira configuração do sistema' : 'Sistema Ministerial de Avisos & Púlpito'}
          </p>
        </div>

        {/* ── BOOTSTRAP ── */}
        {isBootstrap && (
          <>
            {bootstrapStep === 'form' ? (
              <form onSubmit={handleBootstrapContinuar} className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
                  Nenhum obreiro cadastrado. Configure o primeiro administrador para começar.
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Nome do Administrador:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={bootstrapNome}
                    onChange={(e) => setBootstrapNome(e.target.value)}
                    placeholder="Ex: Pr. João da Silva"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Função:
                    </label>
                    <select
                      value={bootstrapCargo}
                      onChange={(e) => setBootstrapCargo(e.target.value as CargoObreiro)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="pastor">Pastor</option>
                      <option value="presbitero">Presbítero</option>
                      <option value="diacono">Diácono</option>
                      <option value="diaconisa">Diaconisa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Gênero:
                    </label>
                    <select
                      value={bootstrapGenero}
                      onChange={(e) => setBootstrapGenero(e.target.value as 'homem' | 'mulher')}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="homem">Homem</option>
                      <option value="mulher">Mulher</option>
                    </select>
                  </div>
                </div>

                {bootstrapError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                    {bootstrapError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleBootstrapConcluir} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs">
                  <span className="font-bold text-amber-400">Administrador:</span> {bootstrapNome}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    <span>Criar PIN administrativo:</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    autoFocus
                    value={bootstrapPin}
                    onChange={(e) => setBootstrapPin(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Confirmar PIN:
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    value={bootstrapPinConfirm}
                    onChange={(e) => setBootstrapPinConfirm(e.target.value)}
                    placeholder="Repita o PIN"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {bootstrapError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                    {bootstrapError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setBootstrapStep('form'); setBootstrapError(''); }}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 text-slate-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Concluir</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ── IDENTIFICAÇÃO NORMAL ── */}
        {!isBootstrap && (
          <form onSubmit={handleEntrar} className="space-y-4">
            
            {/* Lista de Obreiros */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="uppercase tracking-wider text-[10px]">Identificação do Obreiro:</span>
                <span className="text-slate-500 font-medium">{obreiros.length} cadastrados</span>
              </div>
              
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-2xl p-1.5 bg-slate-950/60 no-swipe shadow-inner" data-no-swipe="true">
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
                          ? 'bg-slate-800/90 border-amber-500/70 text-white font-semibold shadow-sm ring-1 ring-amber-500/30'
                          : 'bg-transparent border-transparent hover:bg-slate-850/60 text-slate-300 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                            isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ob.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {ob.nome}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {getCargoLabel(ob.cargo)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
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

            {/* Checkbox: Dirigente do Culto */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
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
                    Habilita o recebimento exclusivo dos avisos no Púlpito.
                  </p>
                </div>
              </label>

              {isDirigindoCulto && (
                <div className="pt-2.5 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  {isSelectedAlreadyDirigente ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Você já está registrado como dirigente deste culto em andamento. Nenhuma senha adicional é necessária.</span>
                    </div>
                  ) : (
                    <>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Senha de Liberação:
                      </label>
                      <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          inputMode="numeric"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="Senha administrativa"
                          className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Erro */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium animate-in fade-in duration-100">
                {errorMsg}
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all touch-target"
            >
              <span>Acessar Painel</span>
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>

            {/* Cadastro de obreiro: apenas admin via Settings */}
            {/* (removido do login após bootstrap — gerenciado em Ajustes > Obreiros) */}
          </form>
        )}
      </div>

      {/* Rodapé */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] text-slate-500 py-2">
        Igreja Presbiteriana Renovada • Auriflama / SP
      </div>
    </div>
  );
};
