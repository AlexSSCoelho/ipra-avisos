import React, { useState } from 'react';
import { User, Heart, CalendarDays, Megaphone, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { FormVisitante } from './FormVisitante';
import { FormOracao } from './FormOracao';
import { FormReuniao } from './FormReuniao';
import { FormAvisoGeral } from './FormAvisoGeral';
import { MeusAvisosHoje } from './MeusAvisosHoje';
import { getCargoLabel } from '../../utils/formatters';
import type { TipoAviso } from '../../types';

export const DiaconoDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { dirigenteAtualNome } = useCulto();

  const [activeCategory, setActiveCategory] = useState<TipoAviso>('visitante');

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3.5 space-y-3.5 overflow-x-hidden">
      
      {/* Banner Ministerial */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 shadow-inner">
            {currentUser?.nome.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider truncate">
              {getCargoLabel(currentUser?.cargo)}
            </div>
            <div className="font-bold text-sm sm:text-base leading-tight text-white truncate">
              {currentUser?.nome}
            </div>
          </div>
        </div>

        {/* Dirigente do Culto no Púlpito */}
        <div className="text-right bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800/90 shrink-0">
          <div className="text-[9px] uppercase font-extrabold tracking-wider text-amber-400 flex items-center justify-end gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>No Púlpito</span>
          </div>
          <div className="text-xs font-bold text-slate-200 truncate max-w-[100px] sm:max-w-[140px] mt-0.5">
            {dirigenteAtualNome.split(' ')[0]} {dirigenteAtualNome.split(' ')[1] || ''}
          </div>
        </div>
      </div>

      {/* Seletor de Categorias Segmentado Premium */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1 flex items-center justify-between">
          <span>Selecione o Tipo de Registro:</span>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-slate-200/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300/70 dark:border-slate-800 shadow-inner no-swipe" data-no-swipe="true">
          {/* 1. Visitante */}
          <button
            type="button"
            onClick={() => setActiveCategory('visitante')}
            className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all touch-target ${
              activeCategory === 'visitante'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm font-black ring-1 ring-indigo-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
            }`}
          >
            <User className={`w-4 h-4 sm:w-5 sm:h-5 ${activeCategory === 'visitante' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
            <span className="text-xs sm:text-sm font-bold">Visitante</span>
          </button>

          {/* 2. Oração */}
          <button
            type="button"
            onClick={() => setActiveCategory('oracao')}
            className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all touch-target ${
              activeCategory === 'oracao'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm font-black ring-1 ring-amber-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${activeCategory === 'oracao' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`} />
            <span className="text-xs sm:text-sm font-bold">Oração</span>
          </button>

          {/* 3. Reuniões */}
          <button
            type="button"
            onClick={() => setActiveCategory('reuniao')}
            className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all touch-target ${
              activeCategory === 'reuniao'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm font-black ring-1 ring-teal-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
            }`}
          >
            <CalendarDays className={`w-4 h-4 sm:w-5 sm:h-5 ${activeCategory === 'reuniao' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}`} />
            <span className="text-xs sm:text-sm font-bold">Reuniões</span>
          </button>

          {/* 4. Geral */}
          <button
            type="button"
            onClick={() => setActiveCategory('geral')}
            className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all touch-target ${
              activeCategory === 'geral'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm font-black ring-1 ring-blue-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
            }`}
          >
            <Megaphone className={`w-4 h-4 sm:w-5 sm:h-5 ${activeCategory === 'geral' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
            <span className="text-xs sm:text-sm font-bold">Avisos</span>
          </button>
        </div>
      </div>

      {/* Formulário Ativo */}
      <div className="w-full max-w-full">
        {activeCategory === 'visitante' && <FormVisitante />}
        {activeCategory === 'oracao' && <FormOracao />}
        {activeCategory === 'reuniao' && <FormReuniao />}
        {activeCategory === 'geral' && <FormAvisoGeral />}
      </div>

      {/* Meus Envios de Hoje */}
      <div className="pt-2">
        <MeusAvisosHoje />
      </div>
    </div>
  );
};
