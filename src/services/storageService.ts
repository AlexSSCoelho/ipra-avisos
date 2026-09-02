import type { Obreiro, CultoAtivo, AvisoItem, FirebaseConfig } from '../types';
import { REAL_OBREIROS_IPRA } from '../data/initialObreiros';
import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  enableIndexedDbPersistence,
  query,
  orderBy
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export const STORAGE_KEYS = {
  OBREIROS: 'ipra_obreiros_v1',
  CULTO_ATIVO: 'ipra_culto_ativo_v1',
  AVISOS: 'ipra_avisos_v1',
  FIREBASE_CONFIG: 'ipra_firebase_config_v1',
  ADMIN_PIN: 'ipra_admin_pin_v1',
  FONT_SCALE: 'ipra_font_scale_v1',
  CURRENT_USER: 'ipra_current_user_v1',
};

class StorageService {
  private firestore: Firestore | null = null;
  private firebaseApp: FirebaseApp | null = null;
  private channel: BroadcastChannel | null = null;
  private avisoListeners = new Set<(avisos: AvisoItem[]) => void>();
  private cultoListeners = new Set<(culto: CultoAtivo | null) => void>();
  private obreiroListeners = new Set<(obreiros: Obreiro[]) => void>();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('ipra_avisos_channel');
    }
    this.initLocalData();
    this.initFirebase();
  }

  private initLocalData() {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.OBREIROS);
      if (!existing) {
        localStorage.setItem(STORAGE_KEYS.OBREIROS, JSON.stringify(REAL_OBREIROS_IPRA));
      } else {
        const parsed: Obreiro[] = JSON.parse(existing);
        if (parsed.length === 0) {
          localStorage.setItem(STORAGE_KEYS.OBREIROS, JSON.stringify(REAL_OBREIROS_IPRA));
        } else {
          // Garante que os obreiros oficiais da IPRA estejam cadastrados preservando registros existentes
          const existingIds = new Set(parsed.map((o) => o.id));
          const toAdd = REAL_OBREIROS_IPRA.filter((ro) => !existingIds.has(ro.id));
          if (toAdd.length > 0) {
            const merged = [...parsed, ...toAdd];
            localStorage.setItem(STORAGE_KEYS.OBREIROS, JSON.stringify(merged));
          }
        }
      }
    } catch {
      // Ignora erro de JSON
    }
  }


  private initFirebase() {
    try {
      // 1. Tentar ler de variáveis de ambiente (VITE_FIREBASE_...)
      const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

      let config: FirebaseConfig | null = null;

      if (envApiKey && envProjectId) {
        config = {
          apiKey: envApiKey,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
          projectId: envProjectId,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        };
      } else {
        // 2. Tentar ler do localStorage (salvo na tela de Ajustes)
        const configStr = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
        if (configStr) {
          config = JSON.parse(configStr);
        }
      }

      if (config && config.apiKey && config.projectId) {
        const apps = getApps();
        this.firebaseApp = apps.length > 0 ? apps[0] : initializeApp(config);
        this.firestore = getFirestore(this.firebaseApp);
        enableIndexedDbPersistence(this.firestore).catch(() => {
          // Persistência local ativada ou ignorada se em abas simultâneas
        });
      }
    } catch (err) {
      console.warn('Firebase não conectado, operando em modo local offline-first:', err);
    }
  }

  public getAdminPin(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) ?? null;
  }

  public hasPinConfigured(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) !== null;
  }

  public setAdminPin(newPin: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
  }

  public getFirebaseConfig(): FirebaseConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveFirebaseConfig(config: FirebaseConfig) {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    this.initFirebase();
  }

  // --- Obreiros ---
  public getObreiros(): Obreiro[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OBREIROS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveObreiros(obreiros: Obreiro[]) {
    localStorage.setItem(STORAGE_KEYS.OBREIROS, JSON.stringify(obreiros));
    this.obreiroListeners.forEach((cb) => cb(obreiros));
    this.broadcast('OBREIROS_UPDATED', obreiros);
  }

  public addObreiro(obreiro: Obreiro) {
    const obreiros = this.getObreiros();
    const updated = [...obreiros, obreiro];
    this.saveObreiros(updated);
  }

  // --- Culto Ativo ---
  public getCultoAtivo(): CultoAtivo | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CULTO_ATIVO);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveCultoAtivo(culto: CultoAtivo) {
    localStorage.setItem(STORAGE_KEYS.CULTO_ATIVO, JSON.stringify(culto));
    this.cultoListeners.forEach((cb) => cb(culto));
    this.broadcast('CULTO_UPDATED', culto);

    if (this.firestore) {
      try {
        const cultoDoc = doc(this.firestore, 'cultos', 'ativo');
        setDoc(cultoDoc, culto, { merge: true });
      } catch (err) {
        console.warn('Erro ao sincronizar culto com Firebase:', err);
      }
    }
  }

  // Troca o dirigente de um culto existente. NÃO cria culto novo.
  public setDirigenteDoCulto(obreiro: Obreiro): boolean {
    const culto = this.getCultoAtivo();
    if (!culto) return false; // sem culto ativo → operação inválida

    const updatedCulto: CultoAtivo = {
      ...culto,
      dirigenteId: obreiro.id,
      dirigenteNome: obreiro.nome,
      dirigenteCargo: obreiro.cargo,
      status: 'em_andamento',
    };

    this.saveCultoAtivo(updatedCulto);
    return true;
  }


  // --- Avisos ---
  public getAvisos(): AvisoItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AVISOS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }


  public saveAvisos(avisos: AvisoItem[]) {
    localStorage.setItem(STORAGE_KEYS.AVISOS, JSON.stringify(avisos));
    this.avisoListeners.forEach((cb) => cb(avisos));
    this.broadcast('AVISOS_UPDATED', avisos);
  }

  public addAviso(aviso: AvisoItem) {
    const avisos = this.getAvisos();
    const updated = [aviso, ...avisos];
    this.saveAvisos(updated);

    if (this.firestore) {
      try {
        const avisoDoc = doc(this.firestore, 'avisos', aviso.id);
        setDoc(avisoDoc, aviso);
      } catch (err) {
        console.warn('Erro ao sincronizar aviso no Firestore:', err);
      }
    }
  }

  public updateAvisoStatus(id: string, status: 'pendente' | 'anunciado') {
    const avisos = this.getAvisos();
    const updated = avisos.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            lidoEm: status === 'anunciado' ? new Date().toISOString() : undefined,
          }
        : item
    );
    this.saveAvisos(updated);

    if (this.firestore) {
      try {
        const avisoDoc = doc(this.firestore, 'avisos', id);
        updateDoc(avisoDoc, {
          status,
          lidoEm: status === 'anunciado' ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.warn('Erro ao atualizar status no Firestore:', err);
      }
    }
  }

  public updateAvisoContent(id: string, updates: Partial<AvisoItem>): boolean {
    const avisos = this.getAvisos();
    const target = avisos.find((a) => a.id === id);
    if (!target || target.status !== 'pendente') {
      return false;
    }

    const updated = avisos.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          visitante: updates.visitante !== undefined ? updates.visitante : item.visitante,
          oracao: updates.oracao !== undefined ? updates.oracao : item.oracao,
          reuniao: updates.reuniao !== undefined ? updates.reuniao : item.reuniao,
          geral: updates.geral !== undefined ? updates.geral : item.geral,
        };
      }
      return item;
    });
    this.saveAvisos(updated);

    if (this.firestore) {
      try {
        const avisoDoc = doc(this.firestore, 'avisos', id);
        const patch: Record<string, unknown> = {};
        if (updates.visitante !== undefined) patch.visitante = updates.visitante;
        if (updates.oracao !== undefined) patch.oracao = updates.oracao;
        if (updates.reuniao !== undefined) patch.reuniao = updates.reuniao;
        if (updates.geral !== undefined) patch.geral = updates.geral;
        updateDoc(avisoDoc, patch);
      } catch (err) {
        console.warn('Erro ao atualizar conteúdo no Firestore:', err);
      }
    }

    return true;
  }

  public deleteAviso(id: string) {
    const avisos = this.getAvisos();
    const updated = avisos.filter((item) => item.id !== id);
    this.saveAvisos(updated);

    if (this.firestore) {
      try {
        const avisoDoc = doc(this.firestore, 'avisos', id);
        deleteDoc(avisoDoc);
      } catch (err) {
        console.warn('Erro ao deletar aviso no Firestore:', err);
      }
    }
  }

  // --- Subscrições em Tempo Real (Offline / Cross-Tab / Firestore) ---
  public subscribeToObreiros(callback: (obreiros: Obreiro[]) => void): () => void {
    this.obreiroListeners.add(callback);

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'OBREIROS_UPDATED') {
        callback(event.data.payload);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleBroadcast);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.OBREIROS && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          callback(parsed);
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      this.obreiroListeners.delete(callback);
      if (this.channel) this.channel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }

  public subscribeToAvisos(callback: (avisos: AvisoItem[]) => void): () => void {
    this.avisoListeners.add(callback);

    let unsubFirestore: (() => void) | null = null;
    if (this.firestore) {
      try {
        const q = query(collection(this.firestore, 'avisos'), orderBy('criadoEm', 'desc'));
        unsubFirestore = onSnapshot(q, (snapshot) => {
          const items: AvisoItem[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as AvisoItem);
          });
          localStorage.setItem(STORAGE_KEYS.AVISOS, JSON.stringify(items));
          this.avisoListeners.forEach((cb) => cb(items));
        });
      } catch (e) {
        console.warn('Falha na subscrição do Firestore, usando fallback local:', e);
      }
    }

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'AVISOS_UPDATED') {
        callback(event.data.payload);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleBroadcast);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.AVISOS && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          callback(parsed);
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      this.avisoListeners.delete(callback);
      if (unsubFirestore) unsubFirestore();
      if (this.channel) this.channel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }

  public subscribeToCulto(callback: (culto: CultoAtivo | null) => void): () => void {
    this.cultoListeners.add(callback);

    let unsubFirestore: (() => void) | null = null;
    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, 'cultos', 'ativo');
        unsubFirestore = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CultoAtivo;
            localStorage.setItem(STORAGE_KEYS.CULTO_ATIVO, JSON.stringify(data));
            this.cultoListeners.forEach((cb) => cb(data));
          }
        });
      } catch (e) {
        console.warn('Falha na subscrição de Culto Firestore:', e);
      }
    }

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'CULTO_UPDATED') {
        callback(event.data.payload);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleBroadcast);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.CULTO_ATIVO && event.newValue) {
        try {
          callback(JSON.parse(event.newValue));
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      this.cultoListeners.delete(callback);
      if (unsubFirestore) unsubFirestore();
      if (this.channel) this.channel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }

  private broadcast(type: string, payload: unknown) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch {
        // Broadcast fallback
      }
    }
  }
}

export const storageService = new StorageService();
