// Cargos Eclesiásticos da IPRA
export type CargoObreiro =
  | 'pastor'
  | 'pastor_presidente' // Menção honrosa
  | 'pastor_fundador' // Menção honrosa
  | 'pastor_auxiliar'
  | 'presbitero'
  | 'diacono'
  | 'diaconisa'
  | 'evangelista_h'
  | 'evangelista_m'
  | 'missionario'
  | 'missionaria'
  | 'admin';

export interface Obreiro {
  id: string;
  nome: string;
  cargo: CargoObreiro;
  genero: 'homem' | 'mulher';
  avatar?: string;
  isAdmin?: boolean;
  isMaster?: boolean;
  ativo: boolean;
}

export interface CultoAtivo {
  id: string;
  data: string; // YYYY-MM-DD
  nomeCulto: string; // Ex: "Culto da Família - Domingo", "Culto de Doutrina - Quarta"
  horarioInicio: string;
  dirigenteId: string;
  dirigenteNome: string;
  dirigenteCargo?: CargoObreiro;
  status: 'em_andamento' | 'finalizado';
}

export type TipoAviso = 'visitante' | 'oracao' | 'reuniao' | 'geral';

export type StatusAviso = 'pendente' | 'anunciado';

export interface VisitanteData {
  nome: string;
  genero: 'homem' | 'mulher' | 'casal' | 'crianca' | 'familia';
  cidade?: string;
  igreja?: string;
  acompanhante?: string;
  observacao?: string;
}

export type CategoriaOracao =
  | 'saude'
  | 'familia'
  | 'causas'
  | 'espiritual'
  | 'agradecimento'
  | 'luto'
  | 'outro';

export interface OracaoData {
  nomePessoa: string;
  categoria: CategoriaOracao;
  motivo?: string;
  urgente: boolean;
}

export type GrupoReuniao =
  | 'oracao_casas'
  | 'irmas'
  | 'varoes'
  | 'jovens'
  | 'criancas'
  | 'adolescentes'
  | 'ensaio'
  | 'outro';

export interface ReuniaoData {
  grupo: GrupoReuniao;
  grupoNomePersonalizado?: string;
  dataTexto: string; // Ex: "Hoje às 19:30", "Próxima Quarta (03/09)"
  dataIso?: string; // YYYY-MM-DD
  horario: string; // Ex: "19h30"
  local: string; // Ex: "Casa do Irmão João - Rua X, 120"
  responsavel?: string;
}

export interface GeralData {
  titulo: string;
  descricao?: string;
  dataEvento?: string;
  destinatario?: string; // Ex: "Toda a Igreja", "Liderança", "Mocidade"
}

export interface AvisoItem {
  id: string;
  cultoId: string;
  tipo: TipoAviso;
  status: StatusAviso;
  criadoEm: string; // ISO string
  lidoEm?: string; // ISO string
  autorId: string;
  autorNome: string;
  autorCargo: CargoObreiro;
  
  // Conteúdo por tipo
  visitante?: VisitanteData;
  oracao?: OracaoData;
  reuniao?: ReuniaoData;
  geral?: GeralData;
}

export interface EditAvisoParams {
  visitante?: VisitanteData;
  oracao?: OracaoData;
  reuniao?: ReuniaoData;
  geral?: GeralData;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
