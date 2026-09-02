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
  Check, 
  Plus, 
  UserCheck, 
  SlidersHorizontal,
  Package,
  KeyRound,
  ShieldCheck,
  Users,
  Cpu
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
  const { 
    currentUser, 
    logout, 
    obreiros, 
    addObreiro, 
    updateAdminPin, 
    configureMigrationPin, 
    importarObreirosOficiais, 
    hasPinConfigured, 
    isAdmin, 
    isMaster,
    verifyObreiroPin,
    setObreiroPin 
  } = useAuth();
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

  // Seletor principal: 'preferencias' (comum) vs 'admin' (exclusivo para administradores)
  const [mainTab, setMainTab] = useState<'preferencias' | 'admin'>('preferencias');
  // Subseções dentro do painel administrativo
  const [adminSection, setAdminSection] = useState<'dirigente' | 'obreiros' | 'seguranca' | 'nuvem'>('dirigente');

  // Troca de dirigente
  const [selectedDirigenteId, setSelectedDirigenteId] = useState(cultoAtivo?.dirigenteId || '');
  const [dirigenteSuccess, setDirigenteSuccess] = useState('');

  // Novo obreiro (Unificado por Cargo e Gênero)
  type CargoUnificado = 'pastor' | 'pastor_auxiliar' | 'presbitero' | 'diacono' | 'evangelista' | 'missionario';
  const [showAddObreiro, setShowAddObreiro] = useState(false);
  const [nome, setNome] = useState('');
  const [cargoUnificado, setCargoUnificado] = useState<CargoUnificado>('diacono');
  const [genero, setGenero] = useState<'homem' | 'mulher'>('homem');
  const [isNovoAdmin, setIsNovoAdmin] = useState(false);
  const [obreiroError, setObreiroError] = useState('');
  const [obreiroSuccess, setObreiroSuccess] = useState('');

  // Alterar minha própria senha
  const [minhaSenhaAtual, setMinhaSenhaAtual] = useState('');
  const [minhaNovaSenha, setMinhaNovaSenha] = useState('');
  const [minhaConfirmarSenha, setMinhaConfirmarSenha] = useState('');
  const [minhaSenhaSuccess, setMinhaSenhaSuccess] = useState('');
  const [minhaSenhaError, setMinhaSenhaError] = useState('');

  // Alterar PIN / Configurar PIN inicial (Admin Master)
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Firebase / Sistema Avançado
  const [firebaseJson, setFirebaseJson] = useState(() => {
    const cfg = storageService.getFirebaseConfig();
    return cfg ? JSON.stringify(cfg, null, 2) : '';
  });
  const [firebaseSaved, setFirebaseSaved] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  if (!isOpen) return null;

  const handleCargoUnificadoChange = (val: CargoUnificado) => {
    setCargoUnificado(val);
    if (val === 'pastor' || val === 'pastor_auxiliar' || val === 'presbitero') {
      setGenero('homem');
    }
  };

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
    setObreiroError('');
    setObreiroSuccess('');

    if (!nome.trim()) {
      setObreiroError('Informe o nome completo do obreiro.');
      return;
    }

    let finalCargo: CargoObreiro = 'diacono';
    let finalGenero: 'homem' | 'mulher' = genero;

    if (cargoUnificado === 'pastor') {
      finalCargo = 'pastor';
      finalGenero = 'homem';
    } else if (cargoUnificado === 'pastor_auxiliar') {
      finalCargo = 'pastor_auxiliar';
      finalGenero = 'homem';
    } else if (cargoUnificado === 'presbitero') {
      finalCargo = 'presbitero';
      finalGenero = 'homem';
    } else if (cargoUnificado === 'diacono') {
      finalCargo = genero === 'mulher' ? 'diaconisa' : 'diacono';
    } else if (cargoUnificado === 'evangelista') {
      finalCargo = genero === 'mulher' ? 'evangelista_m' : 'evangelista_h';
    } else if (cargoUnificado === 'missionario') {
      finalCargo = genero === 'mulher' ? 'missionaria' : 'missionario';
    }

    const res = addObreiro({
      nome: nome.trim(),
      cargo: finalCargo,
      genero: finalGenero,
      isAdmin: isNovoAdmin,
      ativo: true,
    });

    if (res.success) {
      setObreiroSuccess(`Obreiro ${nome.trim()} cadastrado com sucesso!`);
      setNome('');
      setCargoUnificado('diacono');
      setGenero('homem');
      setIsNovoAdmin(false);
      setTimeout(() => {
        setObreiroSuccess('');
        setShowAddObreiro(false);
      }, 2000);
    } else {
      setObreiroError(res.message || 'Erro ao cadastrar obreiro.');
    }
  };

  const handleAlterarMinhaSenha = (e: React.FormEvent) => {
    e.preventDefault();
    setMinhaSenhaError('');
    setMinhaSenhaSuccess('');

    if (!currentUser) return;

    if (!verifyObreiroPin(currentUser.id, minhaSenhaAtual)) {
      setMinhaSenhaError('A senha atual informada está incorreta (senha padrão: 1234).');
      return;
    }

    if (!minhaNovaSenha || !/^\d{4,}$/.test(minhaNovaSenha.trim())) {
      setMinhaSenhaError('A nova senha deve conter apenas números e no mínimo 4 dígitos.');
      return;
    }

    if (minhaNovaSenha.trim() !== minhaConfirmarSenha.trim()) {
      setMinhaSenhaError('A confirmação da nova senha não coincide.');
      return;
    }

    const res = setObreiroPin(currentUser.id, minhaNovaSenha.trim());
    if (res.success) {
      setMinhaSenhaSuccess('Sua senha de acesso foi alterada com sucesso!');
      setMinhaSenhaAtual('');
      setMinhaNovaSenha('');
      setMinhaConfirmarSenha('');
      setTimeout(() => setMinhaSenhaSuccess(''), 3500);
    } else {
      setMinhaSenhaError(res.message || 'Erro ao salvar nova senha.');
    }
  };

  const handleImportarOficiais = () => {
    const res = importarObreirosOficiais();
    setImportMsg(res.message);
    setTimeout(() => setImportMsg(''), 4500);
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
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                Ajustes & Sistema
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAdmin ? 'Preferências pessoais e administração' : 'Preferências pessoais e acessibilidade'}
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

        {/* Seletor Principal de Área (Preferências vs Administração) */}
        {isAdmin && (
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0">
            <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setMainTab('preferencias')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mainTab === 'preferencias'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Preferências do Uso</span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mainTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Painel Administrativo</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-seletor do Painel Administrativo */}
        {isAdmin && mainTab === 'admin' && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'dirigente', label: 'Dirigente', icon: <Crown className="w-3 h-3" /> },
              { id: 'obreiros', label: 'Obreiros', icon: <Users className="w-3 h-3" /> },
              { id: 'seguranca', label: 'Segurança & PIN', icon: <KeyRound className="w-3 h-3" /> },
              { id: 'nuvem', label: 'Sistema Avançado', icon: <Cpu className="w-3 h-3" /> },
            ].map((tab) => {
              const isActive = adminSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminSection(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Conteúdo com Rolagem */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* SEÇÃO 1: PREFERÊNCIAS DO USO & IDENTIFICAÇÃO */}
          {(mainTab === 'preferencias' || !isAdmin) && (
            <div className="space-y-4">
              
              {/* Card de Identificação do Obreiro */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                    {currentUser?.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span>{getCargoLabel(currentUser?.cargo || 'diacono')}</span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 dark:bg-slate-800 text-amber-300 font-bold border border-slate-700">
                          ADMIN
                        </span>
                      )}
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

              {/* Ajustes de Acessibilidade & Aparelho */}
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
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Aplicativo Oficial & Instalação
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Para melhor experiência no púlpito e na recepção
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://github.com/AlexSSCoelho/ipra-avisos/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar APK (Android)</span>
                  </a>

                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={promptInstall}
                      className="p-2.5 rounded-xl bg-emerald-700/30 dark:bg-emerald-900/50 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <Package className="w-4 h-4" />
                      <span>Instalar Web (PWA)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card: Minha Senha de Acesso */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs font-black">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Minha Senha de Acesso
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Troque a senha padrão (1234) por uma senha pessoal de sua escolha
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAlterarMinhaSenha} className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Senha Atual:
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      value={minhaSenhaAtual}
                      onChange={(e) => setMinhaSenhaAtual(e.target.value)}
                      placeholder="Senha atual (ou 1234)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Nova Senha (mín. 4 números):
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        required
                        value={minhaNovaSenha}
                        onChange={(e) => setMinhaNovaSenha(e.target.value)}
                        placeholder="Mínimo 4 números"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Confirmar Nova Senha:
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        required
                        value={minhaConfirmarSenha}
                        onChange={(e) => setMinhaConfirmarSenha(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {minhaSenhaError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      {minhaSenhaError}
                    </div>
                  )}

                  {minhaSenhaSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      {minhaSenhaSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all touch-target"
                  >
                    Salvar Nova Senha
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* SEÇÃO 2: PAINEL ADMINISTRATIVO (SOMENTE ADMIN) */}
          {isAdmin && mainTab === 'admin' && (
            <>
              {/* SUB-ABA: DIRIGENTE */}
              {adminSection === 'dirigente' && (
                <form onSubmit={handleSalvarDirigente} className="space-y-3.5">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>Definir Dirigente do Culto</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Atual: <strong className="text-slate-900 dark:text-white">{dirigenteAtualNome}</strong>
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
                          className={`w-full text-left p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-500/30'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {ob.nome.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">{ob.nome}</div>
                              <div className="text-[10px] text-slate-400">{getCargoLabel(ob.cargo)}</div>
                            </div>
                          </div>
                          {isSelected && <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {dirigenteSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>{dirigenteSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all touch-target"
                  >
                    Confirmar Dirigente
                  </button>
                </form>
              )}

              {/* SUB-ABA: OBREIROS */}
              {adminSection === 'obreiros' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        <span>Membros Ministeriais</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {obreiros.length} obreiros cadastrados
                      </p>
                    </div>

                    {isMaster && (
                      <button
                        type="button"
                        onClick={() => setShowAddObreiro(!showAddObreiro)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddObreiro ? 'Fechar' : 'Novo'}</span>
                      </button>
                    )}
                  </div>

                  {!isMaster && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-600 dark:text-slate-400">
                      Visualização de obreiros. O cadastro e gerenciamento de novos membros ministeriais é exclusivo do Administrador Master.
                    </div>
                  )}

                  {/* Ação Administrativa: Importar Obreiros Oficiais da IPRA (Exclusivo Master) */}
                  {isMaster && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                            Relação Oficial IPRA Auriflama
                          </div>
                          <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                            Importar equipe completa e menções honrosas sem sobrescrever registros
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleImportarOficiais}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 active:scale-95 transition-all shadow-xs"
                        >
                          Importar
                        </button>
                      </div>

                      {importMsg && (
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/40 text-xs font-bold text-amber-900 dark:text-amber-200 animate-in fade-in">
                          {importMsg}
                        </div>
                      )}
                    </div>
                  )}

                  {isMaster && showAddObreiro && (
                    <form onSubmit={handleAddObreiro} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>Cadastrar Novo Obreiro</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Acesso Master</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Nome Completo:</label>
                        <input
                          type="text"
                          required
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Ex: Donozor Monlevade"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Função / Cargo:</label>
                          <select
                            value={cargoUnificado}
                            onChange={(e) => handleCargoUnificadoChange(e.target.value as CargoUnificado)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                          >
                            <option value="pastor">Pastor</option>
                            <option value="pastor_auxiliar">Pastor Auxiliar</option>
                            <option value="presbitero">Presbítero</option>
                            <option value="diacono">Diácono (a)</option>
                            <option value="evangelista">Evangelista</option>
                            <option value="missionario">Missionário (a)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Gênero:</label>
                          {['pastor', 'pastor_auxiliar', 'presbitero'].includes(cargoUnificado) ? (
                            <div className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-500 font-semibold flex items-center justify-between">
                              <span>Homem</span>
                              <span className="text-[10px] text-amber-500 font-bold">(Exclusivo)</span>
                            </div>
                          ) : (
                            <select
                              value={genero}
                              onChange={(e) => setGenero(e.target.value as 'homem' | 'mulher')}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                            >
                              <option value="homem">Homem</option>
                              <option value="mulher">Mulher</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                        Resultado: <strong className="font-bold text-amber-900 dark:text-amber-200">
                          {cargoUnificado === 'pastor' && 'Pastor Titular (Homem)'}
                          {cargoUnificado === 'pastor_auxiliar' && 'Pastor Auxiliar (Homem)'}
                          {cargoUnificado === 'presbitero' && 'Presbítero (Homem)'}
                          {cargoUnificado === 'diacono' && (genero === 'mulher' ? 'Diaconisa (Mulher)' : 'Diácono (Homem)')}
                          {cargoUnificado === 'evangelista' && (genero === 'mulher' ? 'Evangelista (Mulher)' : 'Evangelista (Homem)')}
                          {cargoUnificado === 'missionario' && (genero === 'mulher' ? 'Missionária (Mulher)' : 'Missionário (Homem)')}
                        </strong> • Senha padrão inicial: <strong className="font-mono font-bold">1234</strong>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="novo_admin_check"
                          checked={isNovoAdmin}
                          onChange={(e) => setIsNovoAdmin(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                        />
                        <label htmlFor="novo_admin_check" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                          Conceder acesso de Administrador
                        </label>
                      </div>

                      {obreiroError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          {obreiroError}
                        </div>
                      )}

                      {obreiroSuccess && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          {obreiroSuccess}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all touch-target"
                      >
                        Salvar Obreiro
                      </button>
                    </form>
                  )}

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {obreiros.map((ob) => (
                      <div
                        key={ob.id}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40"
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

              {/* SUB-ABA: SEGURANÇA & PIN */}
              {adminSection === 'seguranca' && (
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
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all touch-target"
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
                        Código numérico para autorizações administrativas no púlpito.
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
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                        {pinError}
                      </div>
                    )}

                    {pinSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        {pinSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all touch-target"
                    >
                      Salvar Nova Senha
                    </button>
                  </form>
                )
              )}

              {/* SUB-ABA: SISTEMA AVANÇADO (NUVEM FIREBASE) */}
              {adminSection === 'nuvem' && (
                <form onSubmit={handleSaveFirebase} className="space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      <span>Sistema Avançado — Nuvem (Firestore)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Configuração opcional de credenciais JSON do Firebase para sincronização remota entre dispositivos.
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
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all touch-target"
                  >
                    Salvar Configurações Avançadas
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
