import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  MapPin, 
  Church, 
  Clock, 
  AlertTriangle,
  Calendar
} from 'lucide-react';
import type { AvisoItem } from '../../types';
import { formatHora, formatHoraMinutosAtras } from '../../utils/formatters';
import { useAccessibility } from '../../context/AccessibilityContext';

interface AvisoCardPulpitoProps {
  aviso: AvisoItem;
  onMarcarLido: (id: string) => void;
  onDesmarcarLido: (id: string) => void;
}

export const AvisoCardPulpito: React.FC<AvisoCardPulpitoProps> = ({
  aviso,
  onMarcarLido,
  onDesmarcarLido,
}) => {
  const { fontScale } = useAccessibility();
  const [isCompleting, setIsCompleting] = useState(false);
  const isAnunciado = aviso.status === 'anunciado';

  const handleMarcar = () => {
    if (isCompleting) return;
    setIsCompleting(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 40, 50]);
    }

    setTimeout(() => {
      onMarcarLido(aviso.id);
      setIsCompleting(false);
    }, 400);
  };

  const getCategoryMeta = () => {
    switch (aviso.tipo) {
      case 'visitante':
        return {
          tag: 'Visitante',
          badgeClass: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          borderAccent: 'border-l-4 border-l-indigo-500',
        };
      case 'oracao':
        return {
          tag: 'Pedido de Oração',
          badgeClass: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          borderAccent: 'border-l-4 border-l-amber-500',
        };
      case 'reuniao':
        return {
          tag: 'Reunião & Encontro',
          badgeClass: 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          borderAccent: 'border-l-4 border-l-teal-500',
        };
      default:
        return {
          tag: 'Comunicado Geral',
          badgeClass: 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          borderAccent: 'border-l-4 border-l-blue-500',
        };
    }
  };

  const meta = getCategoryMeta();

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs w-full max-w-full ${
        isCompleting
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 scale-[0.99]'
          : isAnunciado
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
          : `bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 ${meta.borderAccent}`
      }`}
    >
      {/* Faixa Superior Limpa */}
      <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${meta.badgeClass}`}>
            {meta.tag}
          </span>

          {aviso.tipo === 'oracao' && aviso.oracao?.urgente && !isCompleting && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 uppercase tracking-wide">
              <AlertTriangle className="w-3 h-3" /> Urgente
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300">{formatHora(aviso.criadoEm)}</span>
          <span className="text-[11px] text-slate-400">({formatHoraMinutosAtras(aviso.criadoEm)})</span>
        </div>
      </div>

      {/* Conteúdo Principal com Fonte Escalonável */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* --- 1. VISITANTE --- */}
        {aviso.tipo === 'visitante' && aviso.visitante && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.3 * fontScale}rem` }}
              className="font-black text-slate-900 dark:text-white leading-tight tracking-tight break-words"
            >
              {aviso.visitante.nome}
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {aviso.visitante.cidade && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{aviso.visitante.cidade}</span>
                </div>
              )}

              {aviso.visitante.igreja && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                  <Church className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{aviso.visitante.igreja}</span>
                </div>
              )}
            </div>

            {aviso.visitante.observacao && (
              <div 
                style={{ fontSize: `${0.9 * fontScale}rem` }}
                className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800"
              >
                <span className="font-bold text-slate-700 dark:text-slate-200">Obs: </span>
                {aviso.visitante.observacao}
              </div>
            )}
          </div>
        )}

        {/* --- 2. ORAÇÃO --- */}
        {aviso.tipo === 'oracao' && aviso.oracao && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.3 * fontScale}rem` }}
              className="font-black text-slate-900 dark:text-white leading-tight tracking-tight break-words"
            >
              {aviso.oracao.nomePessoa}
            </div>

            <div 
              style={{ fontSize: `${1.05 * fontScale}rem` }}
              className="text-slate-800 dark:text-slate-100 font-medium italic bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60 leading-relaxed break-words"
            >
              "{aviso.oracao.motivo}"
            </div>
          </div>
        )}

        {/* --- 3. REUNIÃO --- */}
        {aviso.tipo === 'reuniao' && aviso.reuniao && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.3 * fontScale}rem` }}
              className="font-black text-slate-900 dark:text-white leading-tight tracking-tight break-words"
            >
              {aviso.reuniao.dataTexto}
            </div>

            <div 
              style={{ fontSize: `${0.95 * fontScale}rem` }}
              className="text-slate-800 dark:text-slate-100 font-semibold flex items-start gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 break-words"
            >
              <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>{aviso.reuniao.local}</span>
            </div>

            {aviso.reuniao.responsavel && (
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Responsável: <span className="text-slate-800 dark:text-slate-200 font-bold">{aviso.reuniao.responsavel}</span>
              </div>
            )}
          </div>
        )}

        {/* --- 4. GERAL --- */}
        {aviso.tipo === 'geral' && aviso.geral && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.3 * fontScale}rem` }}
              className="font-black text-slate-900 dark:text-white leading-tight tracking-tight break-words"
            >
              {aviso.geral.titulo}
            </div>

            <div 
              style={{ fontSize: `${0.95 * fontScale}rem` }}
              className="text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 break-words"
            >
              {aviso.geral.descricao}
            </div>

            {aviso.geral.dataEvento && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Quando: {aviso.geral.dataEvento}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de Ação Claro e Direto */}
      <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
        {!isAnunciado ? (
          <button
            type="button"
            onClick={handleMarcar}
            disabled={isCompleting}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all duration-200 touch-target ${
              isCompleting
                ? 'bg-emerald-600 text-white scale-98 shadow-emerald-600/50'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white shadow-emerald-600/20'
            }`}
          >
            {isCompleting ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                <span>ANUNCIADO COM SUCESSO! ✓</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <span>MARCAR COMO ANUNCIADO ✓</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDesmarcarLido(aviso.id)}
            className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Voltar para Lista 'A Anunciar'</span>
          </button>
        )}
      </div>
    </div>
  );
};
