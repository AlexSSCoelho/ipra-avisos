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
import { formatHora } from '../../utils/formatters';
import { useAccessibility } from '../../context/AccessibilityContext';

interface AvisoCardPulpitoProps {
  aviso: AvisoItem;
  onMarcarLido: (id: string) => void;
  onDesmarcarLido: (id: string) => void;
  isPulpitMode?: boolean;
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

    // Haptic feedback nativo
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 40, 50]);
    }

    setTimeout(() => {
      onMarcarLido(aviso.id);
      setIsCompleting(false);
    }, 450);
  };

  const getConfig = () => {
    switch (aviso.tipo) {
      case 'visitante':
        return {
          tagLabel: 'VISITANTE',
          tagBg: 'bg-slate-800 text-indigo-300 border-slate-700',
          accentText: 'text-white',
          highlight: 'border-l-4 border-l-indigo-500',
        };
      case 'oracao':
        return {
          tagLabel: 'PEDIDO DE ORAÇÃO',
          tagBg: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
          accentText: 'text-amber-300',
          highlight: 'border-l-4 border-l-amber-500',
        };
      case 'reuniao':
        return {
          tagLabel: 'REUNIÃO / GRUPO',
          tagBg: 'bg-teal-950/80 text-teal-300 border-teal-800/80',
          accentText: 'text-teal-300',
          highlight: 'border-l-4 border-l-teal-500',
        };
      default:
        return {
          tagLabel: 'COMUNICADO GERAL',
          tagBg: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
          accentText: 'text-blue-300',
          highlight: 'border-l-4 border-l-blue-500',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-pulpit w-full max-w-full ${
        isCompleting
          ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/80 scale-[0.99] shadow-emerald-950'
          : isAnunciado
          ? 'bg-zinc-950 border-zinc-900 opacity-50'
          : `bg-[#0f1117] border-zinc-800 ${config.highlight}`
      }`}
    >
      {/* Faixa Superior do Cartão */}
      <div className={`px-3.5 py-2 border-b flex items-center justify-between gap-2 transition-colors duration-200 ${
        isCompleting ? 'bg-emerald-950/90 border-emerald-700/60' : 'bg-black/60 border-zinc-800/80'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
            isCompleting ? 'bg-emerald-900 text-emerald-200 border-emerald-700' : config.tagBg
          }`}>
            {isCompleting ? '✓ CONCLUÍDO' : config.tagLabel}
          </span>

          {aviso.tipo === 'oracao' && aviso.oracao?.urgente && !isCompleting && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/80 text-rose-200 border border-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> PRIORIDADE
            </span>
          )}
        </div>

        <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>{formatHora(aviso.criadoEm)}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 truncate max-w-[80px]">{aviso.autorNome.split(' ')[0]}</span>
        </div>
      </div>

      {/* Conteúdo Principal com Escala de Texto */}
      <div className="p-4 sm:p-5 space-y-3 w-full overflow-hidden">
        {/* --- TIPO: VISITANTE --- */}
        {aviso.tipo === 'visitante' && aviso.visitante && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.35 * fontScale}rem` }}
              className={`font-extrabold leading-tight tracking-tight break-words transition-colors ${
                isCompleting ? 'text-emerald-200' : 'text-white'
              }`}
            >
              {aviso.visitante.nome}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {aviso.visitante.cidade && (
                <div className="px-2.5 py-1 rounded-lg bg-zinc-900 text-slate-200 border border-zinc-800 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="break-words">{aviso.visitante.cidade}</span>
                </div>
              )}

              {aviso.visitante.igreja && (
                <div className="px-2.5 py-1 rounded-lg bg-zinc-900 text-slate-300 border border-zinc-800 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                  <Church className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="break-words">{aviso.visitante.igreja}</span>
                </div>
              )}
            </div>

            {aviso.visitante.observacao && (
              <div 
                style={{ fontSize: `${0.875 * fontScale}rem` }}
                className="text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-zinc-850 break-words"
              >
                <span className="text-zinc-400 font-medium">Nota: </span>
                {aviso.visitante.observacao}
              </div>
            )}
          </div>
        )}

        {/* --- TIPO: ORAÇÃO --- */}
        {aviso.tipo === 'oracao' && aviso.oracao && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.35 * fontScale}rem` }}
              className={`font-extrabold leading-tight tracking-tight break-words transition-colors ${
                isCompleting ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {aviso.oracao.nomePessoa}
            </div>

            <div 
              style={{ fontSize: `${1.05 * fontScale}rem` }}
              className="text-slate-100 font-medium bg-black/50 p-3 rounded-xl border border-zinc-800/80 leading-relaxed break-words"
            >
              "{aviso.oracao.motivo}"
            </div>
          </div>
        )}

        {/* --- TIPO: REUNIÃO --- */}
        {aviso.tipo === 'reuniao' && aviso.reuniao && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.35 * fontScale}rem` }}
              className={`font-extrabold leading-tight tracking-tight break-words transition-colors ${
                isCompleting ? 'text-emerald-300' : 'text-teal-300'
              }`}
            >
              {aviso.reuniao.dataTexto}
            </div>

            <div 
              style={{ fontSize: `${0.95 * fontScale}rem` }}
              className="text-slate-100 font-semibold flex items-start gap-2 bg-black/40 p-3 rounded-xl border border-zinc-800 break-words"
            >
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span className="break-words">{aviso.reuniao.local}</span>
            </div>

            {aviso.reuniao.responsavel && (
              <div className="text-xs text-zinc-400 break-words">
                Responsável: <span className="text-zinc-200 font-medium">{aviso.reuniao.responsavel}</span>
              </div>
            )}
          </div>
        )}

        {/* --- TIPO: GERAL --- */}
        {aviso.tipo === 'geral' && aviso.geral && (
          <div className="space-y-2.5">
            <div 
              style={{ fontSize: `${1.35 * fontScale}rem` }}
              className={`font-extrabold leading-tight tracking-tight break-words transition-colors ${
                isCompleting ? 'text-emerald-300' : 'text-blue-300'
              }`}
            >
              {aviso.geral.titulo}
            </div>

            <div 
              style={{ fontSize: `${0.95 * fontScale}rem` }}
              className="text-slate-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-zinc-800 break-words"
            >
              {aviso.geral.descricao}
            </div>

            {aviso.geral.dataEvento && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Quando: {aviso.geral.dataEvento}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de Leitura do Púlpito com Animação Verde */}
      <div className="p-3 bg-black/60 border-t border-zinc-800/80">
        {!isAnunciado ? (
          <button
            type="button"
            onClick={handleMarcar}
            disabled={isCompleting}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all duration-300 touch-target ${
              isCompleting
                ? 'bg-emerald-500 text-slate-950 scale-95 shadow-emerald-500/50'
                : 'bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white'
            }`}
          >
            {isCompleting ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-bounce text-slate-950" />
                <span className="tracking-wide">ANUNCIADO COM SUCESSO! ✓</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>MARCAR COMO ANUNCIADO ✓</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDesmarcarLido(aviso.id)}
            className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 active:scale-[0.99] text-zinc-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Restaurar para 'A Anunciar'</span>
          </button>
        )}
      </div>
    </div>
  );
};
