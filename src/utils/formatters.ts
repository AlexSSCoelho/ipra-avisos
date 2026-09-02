import type { CargoObreiro, TipoAviso, CategoriaOracao, GrupoReuniao } from '../types';

export const getCargoLabel = (cargo?: CargoObreiro): string => {
  switch (cargo) {
    case 'pastor':
      return 'Pastor Titular';
    case 'pastor_presidente':
      return 'Pastor Presidente (Menção Honrosa)';
    case 'pastor_fundador':
      return 'Pastor Fundador (Menção Honrosa)';
    case 'pastor_auxiliar':
      return 'Pastor Auxiliar';
    case 'presbitero':
      return 'Presbítero';
    case 'diacono':
      return 'Diácono';
    case 'diaconisa':
      return 'Diaconisa';
    case 'evangelista_h':
      return 'Evangelista';
    case 'evangelista_m':
      return 'Evangelista';
    case 'missionario':
      return 'Missionário';
    case 'missionaria':
      return 'Missionária';
    case 'admin':
      return 'Administrador Master';
    default:
      return 'Obreiro(a)';
  }
};

export const getCargoColorClasses = (cargo?: CargoObreiro): { bg: string; text: string; border: string } => {
  switch (cargo) {
    case 'pastor':
      return { 
        bg: 'bg-indigo-50 dark:bg-indigo-950/60', 
        text: 'text-indigo-800 dark:text-indigo-300 font-semibold', 
        border: 'border-indigo-200 dark:border-indigo-800' 
      };
    case 'pastor_presidente':
    case 'pastor_fundador':
      return { 
        bg: 'bg-amber-50 dark:bg-amber-950/60', 
        text: 'text-amber-800 dark:text-amber-300 font-bold', 
        border: 'border-amber-300 dark:border-amber-700' 
      };
    case 'pastor_auxiliar':
      return { 
        bg: 'bg-sky-50 dark:bg-sky-950/60', 
        text: 'text-sky-800 dark:text-sky-300 font-semibold', 
        border: 'border-sky-200 dark:border-sky-800' 
      };
    case 'presbitero':
      return { 
        bg: 'bg-slate-100 dark:bg-slate-800', 
        text: 'text-slate-800 dark:text-slate-200 font-semibold', 
        border: 'border-slate-300 dark:border-slate-700' 
      };
    case 'diacono':
    case 'diaconisa':
      return { 
        bg: 'bg-teal-50 dark:bg-teal-950/60', 
        text: 'text-teal-800 dark:text-teal-300 font-semibold', 
        border: 'border-teal-200 dark:border-teal-800' 
      };
    case 'evangelista_h':
    case 'evangelista_m':
      return { 
        bg: 'bg-amber-50 dark:bg-amber-950/60', 
        text: 'text-amber-800 dark:text-amber-300 font-semibold', 
        border: 'border-amber-200 dark:border-amber-800' 
      };
    case 'missionario':
    case 'missionaria':
      return { 
        bg: 'bg-rose-50 dark:bg-rose-950/60', 
        text: 'text-rose-800 dark:text-rose-300 font-semibold', 
        border: 'border-rose-200 dark:border-rose-800' 
      };
    case 'admin':
      return { 
        bg: 'bg-purple-50 dark:bg-purple-950/60', 
        text: 'text-purple-800 dark:text-purple-300 font-bold', 
        border: 'border-purple-200 dark:border-purple-800' 
      };
    default:
      return { 
        bg: 'bg-slate-100 dark:bg-slate-800', 
        text: 'text-slate-700 dark:text-slate-300', 
        border: 'border-slate-200 dark:border-slate-700' 
      };
  }
};

export const getTipoAvisoLabel = (tipo: TipoAviso): string => {
  switch (tipo) {
    case 'visitante':
      return 'Visitante';
    case 'oracao':
      return 'Pedido de Oração';
    case 'reuniao':
      return 'Reunião & Grupo';
    case 'geral':
      return 'Comunicado Geral';
  }
};

export const getCategoriaOracaoLabel = (cat?: CategoriaOracao): string => {
  switch (cat) {
    case 'saude':
      return 'Saúde & Tratamento';
    case 'familia':
      return 'Família & Lar';
    case 'causas':
      return 'Causas & Trabalho';
    case 'espiritual':
      return 'Vida Espiritual';
    case 'agradecimento':
      return 'Ação de Graças';
    case 'luto':
      return 'Consolo Familiar';
    default:
      return 'Intercessão';
  }
};

export const getGrupoReuniaoLabel = (grupo?: GrupoReuniao): string => {
  switch (grupo) {
    case 'oracao_casas':
      return 'Culto de Oração nos Lares';
    case 'irmas':
      return 'Círculo de Oração (Irmãs)';
    case 'varoes':
      return 'Reunião de Varões';
    case 'jovens':
      return 'Juventude & Mocidade (UMERP)';
    case 'criancas':
      return 'Ministério Infantil & EBD';
    case 'adolescentes':
      return 'Adolescentes';
    case 'ensaio':
      return 'Ensaio de Louvor & Coral';
    default:
      return 'Reunião Eclesiástica';
  }
};

export const formatHora = (isoDateString: string): string => {
  try {
    const d = new Date(isoDateString);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const formatHoraMinutosAtras = (isoDateString: string): string => {
  try {
    const d = new Date(isoDateString);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins === 1) return '1 min atrás';
    if (diffMins < 60) return `${diffMins} min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h atrás';
    return `${diffHours}h atrás`;
  } catch {
    return '';
  }
};

/**
 * Converte 'YYYY-MM-DD' em apresentação legível e amigável (ex: 'Terça-feira, 08/09')
 */
export const formatarDataIsoAmigavel = (isoDate?: string): string => {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate + 'T12:00:00');
    const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${weekdayCapitalized}, ${diaMes}`;
  } catch {
    return isoDate;
  }
};

