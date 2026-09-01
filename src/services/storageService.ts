import type { Obreiro, CultoAtivo, AvisoItem, FirebaseConfig } from '../types';
import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  enableIndexedDbPersistence,
  query,
  orderBy
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

const STORAGE_KEYS = {
  OBREIROS: 'ipra_obreiros_v1',
  CULTO_ATIVO: 'ipra_culto_ativo_v1',
  AVISOS: 'ipra_avisos_v1',
  FIREBASE_CONFIG: 'ipra_firebase_config_v1',
  ADMIN_PIN: 'ipra_admin_pin_v1',
  FONT_SCALE: 'ipra_font_scale_v1',
  CURRENT_USER: 'ipra_current_user_v1',
};

// Obreiros padrão iniciais da IPRA Auriflama
export const DEFAULT_OBREIROS: Obreiro[] = [
  {
    id: 'pastor_titular',
    nome: 'Pr. Carlos Eduardo',
    cargo: 'pastor',
    genero: 'homem',
    isAdmin: true,
    ativo: true,
  },
  {
    id: 'presbitero_joao',
    nome: 'Pb. João Batista',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: true,
    ativo: true,
  },
  {
    id: 'presbitero_marcos',
    nome: 'Pb. Marcos Antônio',
    cargo: 'presbitero',
    genero: 'homem',
    ativo: true,
  },
  {
    id: 'diacono_andre',
    nome: 'Dc. André Luiz',
    cargo: 'diacono',
    genero: 'homem',
    ativo: true,
  },
  {
    id: 'diacono_samuel',
    nome: 'Dc. Samuel Oliveira',
    cargo: 'diacono',
    genero: 'homem',
    ativo: true,
  },
  {
    id: 'diaconisa_maria',
    nome: 'Dca. Maria Aparecida',
    cargo: 'diaconisa',
    genero: 'mulher',
    ativo: true,
  },
  {
    id: 'diaconisa_ester',
    nome: 'Dca. Ester Souza',
    cargo: 'diaconisa',
    genero: 'mulher',
    ativo: true,
  },
  {
    id: 'evangelista_lucas',
    nome: 'Ev. Lucas Gabriel',
    cargo: 'evangelista_h',
    genero: 'homem',
    ativo: true,
  },
  {
    id: 'evangelista_ruth',
    nome: 'Evª. Ruth Helena',
    cargo: 'evangelista_m',
    genero: 'mulher',
    ativo: true,
  },
  {
    id: 'missionaria_ana',
    nome: 'Miss. Ana Paula',
    cargo: 'missionaria',
    genero: 'mulher',
    ativo: true,
  },
];

// Dados iniciais de demonstração
export const INITIAL_CULTO: CultoAtivo = {
  id: 'culto_demo_hoje',
  data: new Date().toISOString().split('T')[0],
  nomeCulto: 'Culto da Família & Celebração',
  horarioInicio: '19:30',
  dirigenteId: 'pastor_titular',
  dirigenteNome: 'Pr. Carlos Eduardo',
  dirigenteCargo: 'pastor',
  status: 'em_andamento',
};

export const INITIAL_AVISOS: AvisoItem[] = [
  {
    id: 'aviso_demo_1',
    cultoId: 'culto_demo_hoje',
    tipo: 'visitante',
    status: 'pendente',
    criadoEm: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    autorId: 'diacono_andre',
    autorNome: 'Dc. André Luiz',
    autorCargo: 'diacono',
    visitante: {
      nome: 'Irmão Roberto e Família',
      genero: 'casal',
      cidade: 'Votuporanga - SP',
      igreja: 'IPRA Central de Votuporanga',
      acompanhante: 'Esposa Cláudia e 2 filhos',
      observacao: 'Parentes da irmã Neusa',
    },
  },
  {
    id: 'aviso_demo_2',
    cultoId: 'culto_demo_hoje',
    tipo: 'oracao',
    status: 'pendente',
    criadoEm: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    autorId: 'diaconisa_maria',
    autorNome: 'Dca. Maria Aparecida',
    autorCargo: 'diaconisa',
    oracao: {
      nomePessoa: 'Dona Francisca (Mãe do Ir. Paulo)',
      categoria: 'saude',
      motivo: 'Internada na Santa Casa para exames cardíacos. Pedem oração pela cura e restauração.',
      urgente: true,
    },
  },
  {
    id: 'aviso_demo_3',
    cultoId: 'culto_demo_hoje',
    tipo: 'reuniao',
    status: 'pendente',
    criadoEm: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    autorId: 'diacono_samuel',
    autorNome: 'Dc. Samuel Oliveira',
    autorCargo: 'diacono',
    reuniao: {
      grupo: 'oracao_casas',
      dataTexto: 'Próxima Terça-feira (02/09)',
      horario: '19h30',
      local: 'Casa do Irmão José Bento - Rua Bahia, nº 450',
      responsavel: 'Dirigente: Pb. Marcos',
    },
  },
  {
    id: 'aviso_demo_4',
    cultoId: 'culto_demo_hoje',
    tipo: 'geral',
    status: 'pendente',
    criadoEm: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    autorId: 'presbitero_joao',
    autorNome: 'Pb. João Batista',
    autorCargo: 'presbitero',
    geral: {
      titulo: 'Santa Ceia do Senhor & Cantina da Mocidade',
      descricao: 'No próximo domingo pela manhã teremos a Santa Ceia e após o culto à noite a Cantina dos Jovens em prol do Congresso.',
      dataEvento: 'Próximo Domingo',
      destinatario: 'Toda a Igreja',
    },
  },
];

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

    if (!localStorage.getItem(STORAGE_KEYS.OBREIROS)) {
      localStorage.setItem(STORAGE_KEYS.OBREIROS, JSON.stringify(DEFAULT_OBREIROS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CULTO_ATIVO)) {
      localStorage.setItem(STORAGE_KEYS.CULTO_ATIVO, JSON.stringify(INITIAL_CULTO));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AVISOS)) {
      localStorage.setItem(STORAGE_KEYS.AVISOS, JSON.stringify(INITIAL_AVISOS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, '1234');
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

  public getAdminPin(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
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
      return raw ? JSON.parse(raw) : DEFAULT_OBREIROS;
    } catch {
      return DEFAULT_OBREIROS;
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
      return raw ? JSON.parse(raw) : INITIAL_CULTO;
    } catch {
      return INITIAL_CULTO;
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

  // Troca o dirigente garantindo a regra de 1 dirigente ativo por vez
  public setDirigenteDoCulto(obreiro: Obreiro) {
    const culto = this.getCultoAtivo() || {
      id: `culto_${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      nomeCulto: 'Culto da Igreja',
      horarioInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dirigenteId: obreiro.id,
      dirigenteNome: obreiro.nome,
      dirigenteCargo: obreiro.cargo,
      status: 'em_andamento',
    };

    const updatedCulto: CultoAtivo = {
      ...culto,
      dirigenteId: obreiro.id,
      dirigenteNome: obreiro.nome,
      dirigenteCargo: obreiro.cargo,
      status: 'em_andamento',
    };

    this.saveCultoAtivo(updatedCulto);
  }

  // --- Avisos ---
  public getAvisos(): AvisoItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AVISOS);
      return raw ? JSON.parse(raw) : INITIAL_AVISOS;
    } catch {
      return INITIAL_AVISOS;
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

  public deleteAviso(id: string) {
    const avisos = this.getAvisos();
    const updated = avisos.filter((item) => item.id !== id);
    this.saveAvisos(updated);
  }

  // --- Subscrições em Tempo Real (Offline / Cross-Tab / Firestore) ---
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
          if (items.length > 0) {
            localStorage.setItem(STORAGE_KEYS.AVISOS, JSON.stringify(items));
            this.avisoListeners.forEach((cb) => cb(items));
          }
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
