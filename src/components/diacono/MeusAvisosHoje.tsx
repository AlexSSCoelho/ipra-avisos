import React from 'react';
import { Clock, CheckCircle2, Trash2, User, Heart, CalendarDays, Megaphone } from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';
import { formatHoraMinutosAtras, getTipoAvisoLabel } from '../../utils/formatters';

export const MeusAvisosHoje: React.FC = () => {
  const { meusAvisosHoje, excluirAviso } = useAvisos();

  if (meusAvisosHoje.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400 opacity-60" />
        <div className="font-semibold text-xs text-slate-600 dark:text-slate-300">
          Nenhum registro transmitido por você neste culto
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Os registros cadastrados acima aparecerão aqui com status em tempo real.
        </p>
      </div>
    );
  }

  const getItemIcon = (tipo: string) => {
    switch (tipo) {
      case 'visitante':
        return <User className="w-3.5 h-3.5 text-indigo-500" />;
      case 'oracao':
        return <Heart className="w-3.5 h-3.5 text-amber-500" />;
      case 'reuniao':
        return <CalendarDays className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <Megaphone className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Registros transmitidos por você ({meusAvisosHoje.length})</span>
        </h3>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ao vivo</span>
        </span>
      </div>

      <div className="space-y-3">
        {meusAvisosHoje.map((aviso) => {
          const isAnunciado = aviso.status === 'anunciado';

          return (
            <div
              key={aviso.id}
              className={`p-4 rounded-2xl border transition-surface ${
                isAnunciado
                  ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
                    {getItemIcon(aviso.tipo)}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {getTipoAvisoLabel(aviso.tipo)}
                    </span>
                    <span className="text-xs font-medium text-slate-400 ml-2">
                      {formatHoraMinutosAtras(aviso.criadoEm)}
                    </span>
                  </div>
                </div>

                {isAnunciado ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Anunciado
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1.5 border border-amber-200 dark:border-amber-800 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>No Púlpito</span>
                  </span>
                )}
              </div>

              <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 pl-11">
                {aviso.tipo === 'visitante' && aviso.visitante && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {aviso.visitante.nome}
                    </span>
                    <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 font-medium">
                      {aviso.visitante.cidade} • {aviso.visitante.igreja}
                    </div>
                  </div>
                )}

                {aviso.tipo === 'oracao' && aviso.oracao && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {aviso.oracao.nomePessoa}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 italic bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed">
                      "{aviso.oracao.motivo}"
                    </p>
                  </div>
                )}

                {aviso.tipo === 'reuniao' && aviso.reuniao && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {aviso.reuniao.dataTexto}
                    </span>
                    <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 font-medium">
                      Local: {aviso.reuniao.local}
                    </div>
                  </div>
                )}

                {aviso.tipo === 'geral' && aviso.geral && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {aviso.geral.titulo}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      {aviso.geral.descricao}
                    </p>
                  </div>
                )}
              </div>

              {!isAnunciado && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja cancelar o envio deste aviso?')) {
                        excluirAviso(aviso.id);
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1.5 font-bold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancelar Envio</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
