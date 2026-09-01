import React, { useState } from 'react';
import { Send, CheckCircle2, Calendar, Clock, MapPin } from 'lucide-react';
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
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">
            Aviso de reunião transmitido ao Púlpito com sucesso.
          </span>
        </div>
      )}

      {/* 1. Selecionar o Grupo / Reunião */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Grupo ou Reunião:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {GRUPOS_REUNIAO.map((item) => {
            const isSelected = grupo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGrupo(item.id)}
                className={`py-2 px-3 rounded-lg border text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
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
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white mt-1.5 focus:outline-none focus:border-slate-900"
          />
        )}
      </div>

      {/* 2. Campo de Data Facilitado */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Data do Encontro:</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {DIAS_RAPIDOS.map((d) => {
            const isSelected = dataSelecionada === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDataSelecionada(d)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white font-semibold shadow-xs'
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
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 mt-1"
          />
        )}
      </div>

      {/* 3. Horário */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Horário:</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {HORARIOS_RAPIDOS.map((h) => {
            const isSelected = horarioSelecionado === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setHorarioSelecionado(h)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white font-semibold shadow-xs'
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
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 mt-1"
          />
        )}
      </div>

      {/* 4. Local da Reunião */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Local ou Endereço: <span className="text-rose-500">*</span></span>
        </label>
        <div className="flex gap-1.5 mb-1.5">
          <button
            type="button"
            onClick={() => setLocal('No Templo da IPRA')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
              local === 'No Templo da IPRA'
                ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 text-white font-semibold'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            No Templo
          </button>
          <button
            type="button"
            onClick={() => setLocal('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
              local !== 'No Templo da IPRA'
                ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 text-white font-semibold'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
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
          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* 5. Responsável */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
          Dirigente ou Responsável (Opcional):
        </label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          placeholder="Ex: Pb. Marcos e Irmã Nilza"
          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] text-white dark:text-slate-950 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all touch-target"
      >
        <Send className="w-4 h-4" />
        <span>Transmitir Aviso de Reunião</span>
      </button>
    </form>
  );
};
