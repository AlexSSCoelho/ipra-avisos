import React, { useState } from 'react';
import { Send, CheckCircle2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';
import type { GrupoReuniao } from '../../types';

const GRUPOS_REUNIAO: { id: GrupoReuniao; label: string }[] = [
  { id: 'oracao_casas', label: 'Culto de Oração nos Lares' },
  { id: 'irmas', label: 'Círculo de Oração (Irmãs)' },
  { id: 'varoes', label: 'Reunião de Varões' },
  { id: 'jovens', label: 'Juventude & Mocidade (UMERP)' },
  { id: 'ensaio', label: 'Ensaio de Louvor / Coral' },
  { id: 'criancas', label: 'Culto Infantil / EBD' },
  { id: 'outro', label: 'Assembleia / Reunião Geral' },
];

const DIAS_RAPIDOS = [
  'Hoje',
  'Amanhã',
  'Próxima Terça-feira',
  'Próxima Quarta-feira',
  'Próxima Quinta-feira',
  'Próximo Sábado',
  'Próximo Domingo',
  'Outro Dia',
];

const HORARIOS_RAPIDOS = [
  '19h30',
  '19h00',
  '20h00',
  '09h00',
  '14h00',
  'Outro',
];

export const FormReuniao: React.FC = () => {
  const { adicionarAviso } = useAvisos();

  const [grupo, setGrupo] = useState<GrupoReuniao>('oracao_casas');
  const [grupoPersonalizado, setGrupoPersonalizado] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('Próxima Terça-feira');
  const [dataPersonalizada, setDataPersonalizada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('19h30');
  const [horarioPersonalizado, setHorarioPersonalizado] = useState('');
  const [local, setLocal] = useState('No Templo da IPRA');
  const [responsavel, setResponsavel] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataFinal = dataSelecionada === 'Outro Dia' ? dataPersonalizada.trim() || 'Data a confirmar' : dataSelecionada;
    const horarioFinal = horarioSelecionado === 'Outro' ? horarioPersonalizado.trim() || '19h30' : horarioSelecionado;

    adicionarAviso({
      tipo: 'reuniao',
      reuniao: {
        grupo,
        grupoNomePersonalizado: grupo === 'outro' ? grupoPersonalizado.trim() : undefined,
        dataTexto: `${dataFinal} às ${horarioFinal}`,
        horario: horarioFinal,
        local: local.trim() || 'No Templo',
        responsavel: responsavel.trim() || undefined,
      },
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    setLocal('No Templo da IPRA');
    setResponsavel('');
    setDataPersonalizada('');
    setHorarioPersonalizado('');
    setGrupoPersonalizado('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            Aviso de reunião transmitido ao Púlpito com sucesso!
          </span>
        </div>
      )}

      {/* 1. Selecionar o Grupo / Reunião */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Grupo ou Reunião:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 no-swipe" data-no-swipe="true">
          {GRUPOS_REUNIAO.map((item) => {
            const isSelected = grupo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGrupo(item.id)}
                className={`py-2.5 px-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 dark:border-teal-600 text-teal-950 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-400/40'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {grupo === 'outro' && (
          <input
            type="text"
            required
            value={grupoPersonalizado}
            onChange={(e) => setGrupoPersonalizado(e.target.value)}
            placeholder="Nome da assembleia ou encontro"
            className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white mt-2 focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
          />
        )}
      </div>

      {/* 2. Campo de Data Facilitado */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span>Data do Encontro:</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5 no-swipe" data-no-swipe="true">
          {DIAS_RAPIDOS.map((d) => {
            const isSelected = dataSelecionada === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDataSelecionada(d)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isSelected
                    ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {dataSelecionada === 'Outro Dia' && (
          <input
            type="text"
            required
            value={dataPersonalizada}
            onChange={(e) => setDataPersonalizada(e.target.value)}
            placeholder="Ex: Sexta-feira, 12 de Setembro"
            className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none mt-2 transition-all"
          />
        )}
      </div>

      {/* 3. Horário */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span>Horário:</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5 no-swipe" data-no-swipe="true">
          {HORARIOS_RAPIDOS.map((h) => {
            const isSelected = horarioSelecionado === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setHorarioSelecionado(h)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isSelected
                    ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>

        {horarioSelecionado === 'Outro' && (
          <input
            type="text"
            required
            value={horarioPersonalizado}
            onChange={(e) => setHorarioPersonalizado(e.target.value)}
            placeholder="Ex: 18h45"
            className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none mt-2 transition-all"
          />
        )}
      </div>

      {/* 4. Local da Reunião */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span>Local ou Endereço: <span className="text-rose-500">*</span></span>
        </label>
        <div className="flex gap-2 mb-2 no-swipe" data-no-swipe="true">
          <button
            type="button"
            onClick={() => setLocal('No Templo da IPRA')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              local === 'No Templo da IPRA'
                ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            No Templo
          </button>
          <button
            type="button"
            onClick={() => setLocal('')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              local !== 'No Templo da IPRA'
                ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Nos Lares / Outro Local
          </button>
        </div>
        <input
          type="text"
          required
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Ex: Residência do Irmão José Bento - Rua Bahia, 450"
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 5. Responsável / Liderança */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span>Responsável / Liderança (Opcional):</span>
        </label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          placeholder="Ex: Pb. Carlos e Irmã Marta / Líder de Jovens"
          className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Botão de Enviar */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span>Transmitir Aviso de Reunião</span>
      </button>
    </form>
  );
};
