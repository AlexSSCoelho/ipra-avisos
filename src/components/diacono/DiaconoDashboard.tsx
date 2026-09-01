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
    <div className="w-full max-w-2xl mx-auto px-3 py-3 space-y-3 overflow-x-hidden">
      
      {/* Banner Ministerial */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
            {currentUser?.nome.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {getCargoLabel(currentUser?.cargo)}
            </div>
            <div className="font-semibold text-xs sm:text-sm leading-tight text-white truncate">
              {currentUser?.nome}
            </div>
          </div>
        </div>

        {/* Dirigente do Culto */}
        <div className="text-right bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-[9px] uppercase font-bold tracking-wider text-amber-400 flex items-center justify-end gap-1">
            <Crown className="w-3 h-3" />
            <span>Púlpito</span>
          </div>
          <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px] sm:max-w-[140px]">
            {dirigenteAtualNome.split(' ')[0]} {dirigenteAtualNome.split(' ')[1] || ''}
          </div>
        </div>
      </div>

      {/* Seletor de Categorias Elegante */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
          Tipo de Registro
        </div>

        <div className="grid grid-cols-4 gap-1 bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300/60 dark:border-slate-800">
          {/* 1. Visitante */}
          <button
            type="button"
            onClick={() => setActiveCategory('visitante')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              activeCategory === 'visitante'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${activeCategory === 'visitante' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
            <span className="text-[10px] sm:text-xs">Visitante</span>
          </button>

          {/* 2. Oração */}
          <button
            type="button"
            onClick={() => setActiveCategory('oracao')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              activeCategory === 'oracao'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeCategory === 'oracao' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`} />
            <span className="text-[10px] sm:text-xs">Oração</span>
          </button>

          {/* 3. Reuniões */}
          <button
            type="button"
            onClick={() => setActiveCategory('reuniao')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              activeCategory === 'reuniao'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarDays className={`w-3.5 h-3.5 ${activeCategory === 'reuniao' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}`} />
            <span className="text-[10px] sm:text-xs">Reuniões</span>
          </button>

          {/* 4. Geral */}
          <button
            type="button"
            onClick={() => setActiveCategory('geral')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              activeCategory === 'geral'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Megaphone className={`w-3.5 h-3.5 ${activeCategory === 'geral' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
            <span className="text-[10px] sm:text-xs">Avisos</span>
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
