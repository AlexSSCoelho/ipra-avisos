import React, { useState } from 'react';
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
  UserCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { storageService } from '../../services/storageService';
import { getCargoLabel } from '../../utils/formatters';
import type { CargoObreiro } from '../../types';

export const ConfigScreen: React.FC = () => {
  const { obreiros, addObreiro, updateAdminPin, isAdmin } = useAuth();
  const { cultoAtivo, definirDirigente } = useCulto();
  const { isInstalled, promptInstall, canInstall } = useAccessibility();

  const [activeSubTab, setActiveSubTab] = useState<'dirigente' | 'obreiros' | 'senha' | 'firebase'>('dirigente');

  const handleInstallApp = async () => {
    const success = await promptInstall();
    if (!success && !canInstall) {
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
      <div className="w-full max-w-md mx-auto px-4 py-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
        <Shield className="w-12 h-12 mx-auto text-amber-500 opacity-80" />
        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Acesso Restrito</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
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
    setDirigenteSuccess(`Dirigente do altar atualizado para ${target.nome}.`);
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
    <div className="w-full max-w-2xl mx-auto px-3 py-3.5 space-y-3.5 overflow-x-hidden">
      
      {/* Banner Master */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Painel de Administração Master</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
              Gestão Ministerial & Sistema
            </h2>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0">
            Acesso Master
          </span>
        </div>

        {/* 4 Sub-Tabs Master com no-swipe */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800 no-swipe" data-no-swipe="true">
          {[
            { id: 'dirigente', label: 'Dirigente', icon: <Crown className="w-4 h-4" /> },
            { id: 'obreiros', label: 'Obreiros', icon: <Users className="w-4 h-4" /> },
            { id: 'senha', label: 'Senha', icon: <KeyRound className="w-4 h-4" /> },
            { id: 'firebase', label: 'Nuvem', icon: <Cloud className="w-4 h-4" /> },
          ].map((tab) => {
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all border truncate touch-target ${
                  isSelected
                    ? 'bg-amber-500 border-transparent text-slate-950 shadow-xs'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
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
        <form onSubmit={handleSalvarDirigente} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Definir Dirigente Ativo do Culto</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Como Administrador Master, selecione qual obreiro está na direção do altar neste momento:
            </p>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-swipe" data-no-swipe="true">
            {obreiros.map((ob) => {
              const isSelected = selectedDirigenteId === ob.id;
              return (
                <button
                  key={ob.id}
                  type="button"
                  onClick={() => setSelectedDirigenteId(ob.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-slate-900 dark:text-white font-bold shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {ob.nome.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold leading-tight truncate">{ob.nome}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {getCargoLabel(ob.cargo)}
                      </div>
                    </div>
                  </div>

                  {isSelected && <UserCheck className="w-5 h-5 text-amber-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {dirigenteSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{dirigenteSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all touch-target"
          >
            Confirmar Dirigente do Culto
          </button>
        </form>
      )}

      {/* SubTab 2: Obreiros */}
      {activeSubTab === 'obreiros' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Quadro de Obreiros ({obreiros.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddObreiro(!showAddObreiro)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Obreiro</span>
            </button>
          </div>

          {showAddObreiro && (
            <form onSubmit={handleAddObreiro} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div className="font-black text-sm text-slate-900 dark:text-white">
                Cadastrar Novo Membro Ministerial
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dc. Marcos Silva"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Função:
                  </label>
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as CargoObreiro)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Gênero:
                  </label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as 'homem' | 'mulher')}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="homem">Homem</option>
                    <option value="mulher">Mulher</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isNovoAdmin}
                  onChange={(e) => setIsNovoAdmin(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 w-4 h-4"
                />
                <span>Permissão de Administrador Master</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddObreiro(false)}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-swipe" data-no-swipe="true">
            {obreiros.map((ob) => (
              <div
                key={ob.id}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                    {ob.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {ob.nome}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {getCargoLabel(ob.cargo)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {ob.isAdmin && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Master
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
        <form onSubmit={handleUpdatePin} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Senha de Segurança Master
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Código numérico exigido para troca de dirigente e autorizações ministeriais.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Senha Atual:
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="Digite a senha atual (padrão: 1234)"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Nova Senha:
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Digite a nova senha"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all touch-target"
          >
            Salvar Nova Senha
          </button>
        </form>
      )}

      {/* SubTab 4: Nuvem Firebase (EXCLUSIVO MASTER) */}
      {activeSubTab === 'firebase' && (
        <form onSubmit={handleSaveFirebase} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-amber-500" />
                <span>Credenciais do Banco na Nuvem</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 uppercase">
                Área Master
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cole aqui as chaves de conexão do Firestore do Google para sincronização entre aparelhos pela internet:
            </p>
          </div>

          <div>
            <textarea
              rows={5}
              value={firebaseJson}
              onChange={(e) => setFirebaseJson(e.target.value)}
              placeholder='{ "apiKey": "AIzaSy...", "projectId": "ipra-avisos", ... }'
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {firebaseSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Chaves de conexão salvas com sucesso.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all touch-target"
          >
            Salvar e Conectar Nuvem
          </button>
        </form>
      )}

      {/* Card de Instalação e Download do APK */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div>
          <div className="text-xs text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4" />
            <span>Instalação no Celular</span>
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
            Baixar Aplicativo Nativo (APK)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Instale o aplicativo oficial (.apk) diretamente no seu Android para usar sem barra de navegação e com desempenho nativo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {/* Botão Baixar APK */}
          <a
            href="/ipra-avisos.apk"
            download="ipra-avisos.apk"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all touch-target"
          >
            <Download className="w-4 h-4" />
            <span>Baixar APK Android (4.5 MB)</span>
          </a>

          {/* Botão Instalar Atalho PWA se suportado */}
          {!isInstalled && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all touch-target"
            >
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Instalar WebApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
