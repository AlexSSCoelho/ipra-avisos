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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Registros transmitidos por você ({meusAvisosHoje.length})
        </h3>
        <span className="text-[10px] text-slate-400">
          Atualização ao vivo
        </span>
      </div>

      <div className="space-y-2">
        {meusAvisosHoje.map((aviso) => {
          const isAnunciado = aviso.status === 'anunciado';

          return (
            <div
              key={aviso.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isAnunciado
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    {getItemIcon(aviso.tipo)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {getTipoAvisoLabel(aviso.tipo)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      {formatHoraMinutosAtras(aviso.criadoEm)}
                    </span>
                  </div>
                </div>

                {isAnunciado ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Anunciado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3 h-3" /> No Púlpito
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 pl-8">
                {aviso.tipo === 'visitante' && aviso.visitante && (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {aviso.visitante.nome}
                    </span>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {aviso.visitante.cidade} • {aviso.visitante.igreja}
                    </div>
                  </div>
                )}

                {aviso.tipo === 'oracao' && aviso.oracao && (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {aviso.oracao.nomePessoa}
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5 italic">
                      "{aviso.oracao.motivo}"
                    </p>
                  </div>
                )}

                {aviso.tipo === 'reuniao' && aviso.reuniao && (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {aviso.reuniao.dataTexto}
                    </span>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Local: {aviso.reuniao.local}
                    </div>
                  </div>
                )}

                {aviso.tipo === 'geral' && aviso.geral && (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {aviso.geral.titulo}
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {aviso.geral.descricao}
                    </p>
                  </div>
                )}
              </div>

              {!isAnunciado && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja cancelar o envio deste aviso?')) {
                        excluirAviso(aviso.id);
                      }
                    }}
                    className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Cancelar</span>
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
