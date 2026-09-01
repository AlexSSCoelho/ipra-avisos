import React, { useState, useEffect } from 'react';
import { 
  Users, 
  KeyRound, 
  Cloud, 
  Plus, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Crown,
  Download,
  Smartphone,
  Shield,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { storageService } from '../../services/storageService';
import { getCargoLabel } from '../../utils/formatters';
import type { CargoObreiro } from '../../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const ConfigScreen: React.FC = () => {
  const { obreiros, addObreiro, updateAdminPin, isAdmin } = useAuth();
  const { cultoAtivo, definirDirigente } = useCulto();

  const [activeSubTab, setActiveSubTab] = useState<'dirigente' | 'obreiros' | 'senha' | 'firebase'>('dirigente');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Capturar evento nativo do Android para instalação com 1 toque
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar no celular:\n1. Toque nos 3 pontinhos do Chrome (topo direito)\n2. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"');
    }
  };

  // Definir dirigente
  const [selectedDirigenteId, setSelectedDirigenteId] = useState(cultoAtivo?.dirigenteId || '');
  const [dirigenteSuccess, setDirigenteSuccess] = useState('');

  // Adicionar obreiro
  const [showAddObreiro, setShowAddObreiro] = useState(false);
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState<CargoObreiro>('diacono');
  const [genero, setGenero] = useState<'homem' | 'mulher'>('homem');
  const [isNovoAdmin, setIsNovoAdmin] = useState(false);

  // Alterar Senha
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Firebase Config
  const [firebaseJson, setFirebaseJson] = useState(() => {
    const cfg = storageService.getFirebaseConfig();
    return cfg ? JSON.stringify(cfg, null, 2) : '';
  });
  const [firebaseSaved, setFirebaseSaved] = useState(false);

  if (!isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 text-center text-zinc-400 space-y-3">
        <Shield className="w-10 h-10 mx-auto text-amber-500 opacity-60" />
        <h3 className="font-bold text-white text-base">Acesso Restrito</h3>
        <p className="text-xs text-zinc-400">
          Esta área é exclusiva para a Administração Master e Secretaria da IPRA.
        </p>
      </div>
    );
  }

  const handleSalvarDirigente = (e: React.FormEvent) => {
    e.preventDefault();
    const target = obreiros.find((o) => o.id === selectedDirigenteId);
    if (!target) return;

    definirDirigente(target);
    setDirigenteSuccess(`Dirigente do culto atualizado para ${target.nome}.`);
    setTimeout(() => setDirigenteSuccess(''), 3000);
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

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!currentPin || !newPin) {
      setPinError('Preencha os campos de senha.');
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
      alert('Formato JSON inválido. Cole o objeto de configuração do Firebase.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3 space-y-3 overflow-x-hidden">
      
      {/* Banner Master */}
      <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel de Administração Master</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
              Gestão Ministerial & Sistema
            </h2>
          </div>

          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase shrink-0">
            Acesso Master
          </span>
        </div>

        {/* 4 Sub-Tabs Master */}
        <div className="grid grid-cols-4 gap-1 pt-1 border-t border-zinc-850">
          {[
            { id: 'dirigente', label: 'Dirigente', icon: <Crown className="w-3.5 h-3.5" /> },
            { id: 'obreiros', label: 'Obreiros', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'senha', label: 'Senha', icon: <KeyRound className="w-3.5 h-3.5" /> },
            { id: 'firebase', label: 'Nuvem', icon: <Cloud className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-1 transition-all border truncate ${
                  isSelected
                    ? 'bg-amber-500 border-transparent text-slate-950 font-bold shadow-xs'
                    : 'bg-black/50 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SubTab 1: Definir Dirigente do Culto */}
      {activeSubTab === 'dirigente' && (
        <form onSubmit={handleSalvarDirigente} className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Definir Dirigente Ativo do Culto</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Como Administrador Master, selecione qual obreiro está na direção do altar neste momento:
            </p>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {obreiros.map((ob) => {
              const isSelected = selectedDirigenteId === ob.id;
              return (
                <button
                  key={ob.id}
                  type="button"
                  onClick={() => setSelectedDirigenteId(ob.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 text-white font-medium shadow-xs'
                      : 'bg-black/40 border-zinc-800/80 hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {ob.nome.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white leading-tight truncate">{ob.nome}</div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {getCargoLabel(ob.cargo)}
                      </div>
                    </div>
                  </div>

                  {isSelected && <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {dirigenteSuccess && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{dirigenteSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            Confirmar Dirigente do Culto
          </button>
        </form>
      )}

      {/* SubTab 2: Obreiros */}
      {activeSubTab === 'obreiros' && (
        <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-zinc-300">
              Quadro de Obreiros ({obreiros.length})
            </h3>
            <button
              onClick={() => setShowAddObreiro(!showAddObreiro)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Obreiro</span>
            </button>
          </div>

          {showAddObreiro && (
            <form onSubmit={handleAddObreiro} className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 space-y-3 animate-in fade-in">
              <div className="font-semibold text-xs text-white">
                Cadastrar Novo Membro Ministerial
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dc. Marcos Silva"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Função:
                  </label>
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as CargoObreiro)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-white"
                  >
                    <option value="pastor">Pastor</option>
                    <option value="presbitero">Presbítero</option>
                    <option value="diacono">Diácono</option>
                    <option value="diaconisa">Diaconisa</option>
                    <option value="evangelista_h">Evangelista (Homem)</option>
                    <option value="evangelista_m">Evangelista (Mulher)</option>
                    <option value="missionario">Missionário</option>
                    <option value="missionaria">Missionária</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Gênero:
                  </label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as 'homem' | 'mulher')}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-white"
                  >
                    <option value="homem">Homem</option>
                    <option value="mulher">Mulher</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isNovoAdmin}
                  onChange={(e) => setIsNovoAdmin(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
                />
                <span>Permissão de Administrador Master</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddObreiro(false)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {obreiros.map((ob) => (
              <div
                key={ob.id}
                className="px-3 py-2 rounded-xl border border-zinc-800/90 flex items-center justify-between bg-black/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center text-xs shrink-0">
                    {ob.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white leading-tight truncate">
                      {ob.nome}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {getCargoLabel(ob.cargo)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {ob.isAdmin && (
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Master
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Senha Admin */}
      {activeSubTab === 'senha' && (
        <form onSubmit={handleUpdatePin} className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-white">
              Senha de Segurança Master
            </h3>
            <p className="text-[11px] text-zinc-400">
              Código numérico exigido para troca de dirigente e autorizações ministeriais.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Senha Atual:
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="Digite a senha atual (padrão: 1234)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Nova Senha:
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Digite a nova senha"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {pinError && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            Salvar Nova Senha
          </button>
        </form>
      )}

      {/* SubTab 4: Nuvem Firebase (EXCLUSIVO MASTER) */}
      {activeSubTab === 'firebase' && (
        <form onSubmit={handleSaveFirebase} className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>Credenciais do Banco na Nuvem</span>
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                Área Master
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Cole aqui as chaves de conexão do Firestore do Google para sincronização entre aparelhos pela internet:
            </p>
          </div>

          <div>
            <textarea
              rows={5}
              value={firebaseJson}
              onChange={(e) => setFirebaseJson(e.target.value)}
              placeholder='{ "apiKey": "AIzaSy...", "projectId": "ipra-avisos", ... }'
              className="w-full p-2.5 font-mono text-[10px] rounded-xl border border-zinc-700 bg-black/60 text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {firebaseSaved && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Chaves de conexão salvas com sucesso.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            Salvar e Conectar Nuvem
          </button>
        </form>
      )}

      {/* Card de Instalação do App */}
      <div className="bg-black/40 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {isInstalled ? 'Aplicativo Instalado' : 'Instalar no Celular'}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {isInstalled ? 'Funcionando em modo aplicativo nativo' : 'Crie o ícone na tela inicial'}
            </div>
          </div>
        </div>

        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallApp}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs shrink-0 flex items-center gap-1 transition-all"
          >
            <Download className="w-3 h-3" />
            <span>Instalar</span>
          </button>
        )}
      </div>
    </div>
  );
};
