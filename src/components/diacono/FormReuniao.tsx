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

/**
 * Calcula a data absoluta (ISO) e a descrição amigável a partir da opção selecionada
 */
function calcularDataReuniao(
  opcaoDia: string,
  dataCustomIso: string,
  baseDate = new Date()
): { dataIso: string; dataTextoAmigavel: string } {
  if (opcaoDia === 'Outro Dia') {
    if (dataCustomIso) {
      try {
        const d = new Date(dataCustomIso + 'T12:00:00');
        const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
        const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        return {
          dataIso: dataCustomIso,
          dataTextoAmigavel: `${weekdayCapitalized}, ${diaMes}`,
        };
      } catch {
        return { dataIso: dataCustomIso, dataTextoAmigavel: dataCustomIso };
      }
    }
    const isoHoje = baseDate.toISOString().split('T')[0];
    return { dataIso: isoHoje, dataTextoAmigavel: 'Data a confirmar' };
  }

  const d = new Date(baseDate);

  if (opcaoDia === 'Hoje') {
    const iso = d.toISOString().split('T')[0];
    const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { dataIso: iso, dataTextoAmigavel: `Hoje (${diaMes})` };
  }

  if (opcaoDia === 'Amanhã') {
    d.setDate(d.getDate() + 1);
    const iso = d.toISOString().split('T')[0];
    const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { dataIso: iso, dataTextoAmigavel: `Amanhã (${diaMes})` };
  }

  const diasSemanaMap: Record<string, number> = {
    'Próximo Domingo': 0,
    'Próxima Terça-feira': 2,
    'Próxima Quarta-feira': 3,
    'Próxima Quinta-feira': 4,
    'Próximo Sábado': 6,
  };

  if (diasSemanaMap[opcaoDia] !== undefined) {
    const targetDay = diasSemanaMap[opcaoDia];
    const currentDay = d.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7; // Próxima ocorrência nos próximos 7 dias
    d.setDate(d.getDate() + diff);
    const iso = d.toISOString().split('T')[0];
    const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const nomeDia = opcaoDia.replace('Próxima ', '').replace('Próximo ', '');
    return { dataIso: iso, dataTextoAmigavel: `${nomeDia} (${diaMes})` };
  }

  const iso = d.toISOString().split('T')[0];
  return { dataIso: iso, dataTextoAmigavel: opcaoDia };
}

export const FormReuniao: React.FC = () => {
  const { adicionarAviso } = useAvisos();

  // 1. Qual reunião?
  const [grupo, setGrupo] = useState<GrupoReuniao>('oracao_casas');
  const [grupoPersonalizado, setGrupoPersonalizado] = useState('');

  // 2. Quando? (Data e Horário)
  const [dataSelecionada, setDataSelecionada] = useState('Próxima Terça-feira');
  const [dataPersonalizadaIso, setDataPersonalizadaIso] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [horarioSelecionado, setHorarioSelecionado] = useState('19h30');
  const [horarioPersonalizado, setHorarioPersonalizado] = useState('');

  // 3. Onde?
  const [local, setLocal] = useState('No Templo da IPRA');

  // 4. Responsável
  const [responsavel, setResponsavel] = useState('');

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const horarioFinal =
      horarioSelecionado === 'Outro'
        ? horarioPersonalizado.trim() || '19h30'
        : horarioSelecionado;

    const { dataIso, dataTextoAmigavel } = calcularDataReuniao(
      dataSelecionada,
      dataPersonalizadaIso
    );

    adicionarAviso({
      tipo: 'reuniao',
      reuniao: {
        grupo,
        grupoNomePersonalizado: grupo === 'outro' ? grupoPersonalizado.trim() || undefined : undefined,
        dataIso,
        dataTexto: `${dataTextoAmigavel} às ${horarioFinal}`,
        horario: horarioFinal,
        local: local.trim() || 'No Templo da IPRA',
        responsavel: responsavel.trim() || undefined,
      },
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    setLocal('No Templo da IPRA');
    setResponsavel('');
    setHorarioPersonalizado('');
    setGrupoPersonalizado('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 w-full max-w-full overflow-hidden transition-surface"
    >
      {/* Banner de Sucesso */}
      {showSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            Aviso de reunião transmitido ao Púlpito com sucesso!
          </span>
        </div>
      )}

      {/* ── 1. QUAL REUNIÃO? ── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>1. Qual Reunião / Encontro? <span className="text-rose-500">*</span></span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 no-swipe" data-no-swipe="true">
          {GRUPOS_REUNIAO.map((item) => {
            const isSelected = grupo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGrupo(item.id)}
                className={`py-2.5 px-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all touch-target ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 text-teal-950 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500/40'
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
            placeholder="Nome da assembleia ou encontro especial"
            className="w-full px-3.5 py-3 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white mt-2 focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
          />
        )}
      </div>

      {/* ── 2. QUANDO? (DATA & HORÁRIO) ── */}
      <div className="space-y-3 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>2. Quando será? (Data): <span className="text-rose-500">*</span></span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-1.5 no-swipe" data-no-swipe="true">
            {DIAS_RAPIDOS.map((d) => {
              const isSelected = dataSelecionada === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDataSelecionada(d)}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all touch-target ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {dataSelecionada === 'Outro Dia' && (
            <div className="mt-2 space-y-1">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Selecione a data exata do calendário:
              </label>
              <input
                type="date"
                required
                value={dataPersonalizadaIso}
                onChange={(e) => setDataPersonalizadaIso(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          )}
        </div>

        {/* Horário */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Horário de Início: <span className="text-rose-500">*</span></span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-1.5 no-swipe" data-no-swipe="true">
            {HORARIOS_RAPIDOS.map((h) => {
              const isSelected = horarioSelecionado === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorarioSelecionado(h)}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all touch-target ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
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
              placeholder="Ex: 18h45 ou 20h30"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 mt-1 transition-all"
            />
          )}
        </div>
      </div>

      {/* ── 3. ONDE? (LOCAL) ── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>3. Onde será? (Local ou Endereço): <span className="text-rose-500">*</span></span>
        </label>
        <div className="flex gap-2 mb-2 no-swipe" data-no-swipe="true">
          <button
            type="button"
            onClick={() => setLocal('No Templo da IPRA')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all touch-target ${
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
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all touch-target ${
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

      {/* ── 4. RESPONSÁVEL (OPCIONAL) ── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>4. Responsável / Liderança (Opcional):</span>
        </label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          placeholder="Ex: Pb. Donozor Monlevade / Irmã Marta"
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
