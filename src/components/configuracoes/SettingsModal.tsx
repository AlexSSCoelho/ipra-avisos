import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Download, 
  Smartphone, 
  Cloud, 
  Check, 
  Plus, 
  UserCheck, 
  SlidersHorizontal,
  Package,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { storageService } from '../../services/storageService';
import { getCargoLabel } from '../../utils/formatters';
import type { CargoObreiro } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout, obreiros, addObreiro, updateAdminPin, configureMigrationPin, hasPinConfigured, isAdmin } = useAuth();
  const { cultoAtivo, dirigenteAtualNome, definirDirigente } = useCulto();
  const { 
    isPulpitMode, 
    setIsPulpitMode, 
    soundEnabled, 
    setSoundEnabled,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    isInstalled,
    promptInstall
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'geral' | 'dirigente' | 'obreiros' | 'seguranca' | 'nuvem'>('geral');

  // Troca de dirigente
  const [selectedDirigenteId, setSelectedDirigenteId] = useState(cultoAtivo?.dirigenteId || '');
  const [dirigenteSuccess, setDirigenteSuccess] = useState('');

  // Novo obreiro
  const [showAddObreiro, setShowAddObreiro] = useState(false);
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState<CargoObreiro>('diacono');
  const [genero, setGenero] = useState<'homem' | 'mulher'>('homem');
  const [isNovoAdmin, setIsNovoAdmin] = useState(false);

  // Alterar PIN / Configurar PIN inicial
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Firebase
  const [firebaseJson, setFirebaseJson] = useState(() => {
    const cfg = storageService.getFirebaseConfig();
    return cfg ? JSON.stringify(cfg, null, 2) : '';
  });
  const [firebaseSaved, setFirebaseSaved] = useState(false);

  if (!isOpen) return null;

  const handleSalvarDirigente = (e: React.FormEvent) => {
    e.preventDefault();
    const target = obreiros.find((o) => o.id === selectedDirigenteId);
    if (!target) return;
    const result = definirDirigente(target);
    if (result.success) {
      setDirigenteSuccess(`Dirigente alterado para ${target.nome}.`);
      setTimeout(() => setDirigenteSuccess(''), 3000);
    } else {
      setDirigenteSuccess(`Erro: ${result.message || 'Não foi possível alterar o dirigente.'}`);
    }
  };

  const handleAddObreiro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    addObreiro({
      nome: nome.trim(),
      cargo,
      genero,
      isAdmin: isNovoAdmin,
      ativo: true,
    });
    setNome('');
    setIsNovoAdmin(false);
    setShowAddObreiro(false);
  };

  const handleConfigureInitialPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');
    if (!newPin || !/^\d{4,}$/.test(newPin.trim())) {
      setPinError('O PIN administrativo deve conter apenas números e pelo menos 4 dígitos.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Os PINs digitados não coincidem.');
      return;
    }
    const res = configureMigrationPin(newPin);
    if (res.success) {
      setPinSuccess('PIN administrativo configurado com sucesso.');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinSuccess(''), 3000);
    } else {
      setPinError(res.message || 'Não foi possível configurar o PIN.');
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');
    if (!currentPin || !newPin) {
      setPinError('Preencha os campos.');
      return;
    }
    if (!newPin || !/^\d{4,}$/.test(newPin.trim())) {
      setPinError('A nova senha deve conter apenas números e pelo menos 4 dígitos.');
      return;
    }
    if (updateAdminPin(currentPin, newPin)) {
      setPinSuccess('Senha administrativa atualizada com sucesso.');
      setCurrentPin('');
      setNewPin('');
      setTimeout(() => setPinSuccess(''), 3000);
    } else {
      setPinError('Senha atual incorreta.');
    }
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(firebaseJson);
      storageService.saveFirebaseConfig(parsed);
      setFirebaseSaved(true);
      setTimeout(() => setFirebaseSaved(false), 3000);
    } catch {
      alert('Formato JSON inválido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                Ajustes & Sistema
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perfil, acessibilidade e administração
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas do Modal */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/80 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'geral', label: 'Preferências' },
            ...(isAdmin ? [
              { id: 'dirigente', label: 'Dirigente' },
              { id: 'obreiros', label: 'Obreiros' },
              { id: 'seguranca', label: 'Segurança & PIN' },
              { id: 'nuvem', label: 'Nuvem & Sistema' },
            ] : [])
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: GERAL & PERFIL */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              
              {/* Card de Perfil */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                    {currentUser?.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">
                      {getCargoLabel(currentUser?.cargo || 'diacono')}
                    </div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser?.nome}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair / Trocar</span>
                </button>
              </div>

              {/* Ajustes de Acessibilidade */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Preferências do Aparelho
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Som */}
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-2 hover:border-amber-400/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Alerta Sonoro</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {soundEnabled ? 'Ativado ao receber aviso' : 'Silenciado'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      soundEnabled ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {soundEnabled ? 'LIGADO' : 'DESLIGADO'}
                    </span>
                  </button>

                  {/* Modo Noturno / Púlpito */}
                  <button
                    type="button"
                    onClick={() => setIsPulpitMode(!isPulpitMode)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-2 hover:border-amber-400/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {isPulpitMode ? (
                        <Moon className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <Sun className="w-5 h-5 text-amber-500" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Modo Escuro</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isPulpitMode ? 'Tema escuro ativado' : 'Tema claro padrão'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isPulpitMode ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isPulpitMode ? 'ESCURO' : 'CLARO'}
                    </span>
                  </button>
                </div>

                {/* Tamanho da Fonte */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Tamanho do Texto</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Ajustar legibilidade</div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={decreaseFontSize}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center active:scale-95"
                    >
                      A⁻
                    </button>
                    <button
                      type="button"
                      onClick={resetFontSize}
                      className="px-2 h-8 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center"
                    >
                      {Math.round(fontScale * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={increaseFontSize}
                      className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      A⁺
                    </button>
                  </div>
                </div>
              </div>

              {/* Card de Instalação e APK */}
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Aplicativo Oficial Instalável (APK)
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Instale no seu Android para usar sem navegador
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href="/ipra-avisos.apk"
                    download="ipra-avisos.apk"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar APK (4.5 MB)</span>
                  </a>

                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={promptInstall}
                      className="px-3 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Web</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRIGENTE */}
          {activeTab === 'dirigente' && isAdmin && (
            <form onSubmit={handleSalvarDirigente} className="space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Selecionar Dirigente do Altar</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atual: <span className="font-bold text-amber-500">{dirigenteAtualNome}</span>
                </p>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {obreiros.map((ob) => {
                  const isSelected = selectedDirigenteId === ob.id;
                  return (
                    <button
                      key={ob.id}
                      type="button"
                      onClick={() => setSelectedDirigenteId(ob.id)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-slate-900 dark:text-white font-bold ring-1 ring-amber-500/40'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {ob.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{ob.nome}</div>
                          <div className="text-[10px] text-slate-400 truncate">{getCargoLabel(ob.cargo)}</div>
                        </div>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {dirigenteSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{dirigenteSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
              >
                Confirmar Dirigente
              </button>
            </form>
          )}

          {/* TAB 3: OBREIROS */}
          {activeTab === 'obreiros' && isAdmin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Membros Ministeriais ({obreiros.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddObreiro(!showAddObreiro)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo</span>
                </button>
              </div>

              {showAddObreiro && (
                <form onSubmit={handleAddObreiro} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in">
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo do obreiro"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value as CargoObreiro)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="pastor">Pastor</option>
                      <option value="presbitero">Presbítero</option>
                      <option value="diacono">Diácono</option>
                      <option value="diaconisa">Diaconisa</option>
                      <option value="evangelista_h">Evangelista</option>
                      <option value="missionario">Missionário</option>
                    </select>

                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value as 'homem' | 'mulher')}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="homem">Homem</option>
                      <option value="mulher">Mulher</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddObreiro(false)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 text-xs font-black rounded-xl bg-amber-500 text-slate-950"
                    >
                      Cadastrar
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {obreiros.map((ob) => (
                  <div
                    key={ob.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
                        {ob.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{ob.nome}</div>
                        <div className="text-[10px] text-slate-400 truncate">{getCargoLabel(ob.cargo)}</div>
                      </div>
                    </div>
                    {ob.isAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEGURANÇA / SENHA */}
          {activeTab === 'seguranca' && isAdmin && (
            !hasPinConfigured ? (
              <form onSubmit={handleConfigureInitialPin} className="space-y-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Configuração do Primeiro PIN Administrativo</span>
                  </div>
                  <p className="leading-relaxed">
                    Esta instalação ainda não possui um PIN administrativo configurado. Como administrador, defina agora o PIN administrativo de segurança do sistema.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Novo PIN Administrativo:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Mínimo 4 dígitos numéricos"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Confirmar Novo PIN:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repita o PIN"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    {pinError}
                  </div>
                )}

                {pinSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {pinSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  Gravar PIN Administrativo
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdatePin} className="space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Alterar Senha Administrativa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Código de 4 dígitos para autorizações no púlpito.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Senha Atual:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Senha atual"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nova Senha:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Nova senha de 4 dígitos numéricos"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    {pinError}
                  </div>
                )}

                {pinSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {pinSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  Salvar Nova Senha
                </button>
              </form>
            )
          )}

          {/* TAB 5: NUVEM FIREBASE */}
          {activeTab === 'nuvem' && isAdmin && (
            <form onSubmit={handleSaveFirebase} className="space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-500" />
                  <span>Configuração da Nuvem (Firestore)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cole as credenciais JSON do Firebase para sincronização online:
                </p>
              </div>

              <textarea
                rows={5}
                value={firebaseJson}
                onChange={(e) => setFirebaseJson(e.target.value)}
                placeholder='{ "apiKey": "...", "projectId": "ipra-avisos", ... }'
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />

              {firebaseSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  Conexão com a nuvem salva com sucesso!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
              >
                Salvar e Conectar Nuvem
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
