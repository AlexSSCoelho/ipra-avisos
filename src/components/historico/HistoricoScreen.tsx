import React, { useState, useMemo } from 'react';
import { 
  Archive, 
  Search, 
  Check, 
  Clock, 
  Share2, 
  X, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';
import { useCulto } from '../../context/CultoContext';
import { formatHora, getTipoAvisoLabel, getCargoLabel } from '../../utils/formatters';
import type { TipoAviso } from '../../types';

export const HistoricoScreen: React.FC = () => {
  const { avisos } = useAvisos();
  const { cultoAtivo, historicoCultos } = useCulto();

  // ID da sessão selecionada (padrão: culto ativo em andamento ou o mais recente do histórico)
  const [cultoSelecionadoId, setCultoSelecionadoId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoAviso | 'todos'>('todos');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'anunciado' | 'pendente'>('todos');
  const [copied, setCopied] = useState(false);

  // Sessão padrão calculada
  const idSessaoEfetiva = useMemo(() => {
    if (cultoSelecionadoId) return cultoSelecionadoId;
    if (cultoAtivo && cultoAtivo.status === 'em_andamento') return cultoAtivo.id;
    if (historicoCultos.length > 0) return historicoCultos[0].id;
    if (cultoAtivo) return cultoAtivo.id;
    return '';
  }, [cultoSelecionadoId, cultoAtivo, historicoCultos]);

  // Objeto do culto / sessão selecionada
  const sessaoSelecionada = useMemo(() => {
    return (
      historicoCultos.find((c) => c.id === idSessaoEfetiva) ||
      (cultoAtivo?.id === idSessaoEfetiva ? cultoAtivo : null)
    );
  }, [historicoCultos, idSessaoEfetiva, cultoAtivo]);

  // Avisos restritos à sessão selecionada
  const avisosDaSessao = useMemo(() => {
    if (!idSessaoEfetiva) return [];
    return avisos.filter((item) => item.cultoId === idSessaoEfetiva);
  }, [avisos, idSessaoEfetiva]);

  // Métricas estritas da sessão selecionada
  const stats = useMemo(() => {
    return {
      visitantes: avisosDaSessao.filter((a) => a.tipo === 'visitante').length,
      oracoes: avisosDaSessao.filter((a) => a.tipo === 'oracao').length,
      reunioes: avisosDaSessao.filter((a) => a.tipo === 'reuniao').length,
      gerais: avisosDaSessao.filter((a) => a.tipo === 'geral').length,
      anunciados: avisosDaSessao.filter((a) => a.status === 'anunciado').length,
      pendentes: avisosDaSessao.filter((a) => a.status === 'pendente').length,
      total: avisosDaSessao.length,
    };
  }, [avisosDaSessao]);

  // Filtros aplicados sobre os avisos da sessão
  const avisosFiltrados = useMemo(() => {
    return avisosDaSessao.filter((item) => {
      if (selectedTipo !== 'todos' && item.tipo !== selectedTipo) {
        return false;
      }

      if (statusFiltro !== 'todos' && item.status !== statusFiltro) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nomeVisitante = item.visitante?.nome.toLowerCase() || '';
        const cidade = item.visitante?.cidade?.toLowerCase() || '';
        const igreja = item.visitante?.igreja?.toLowerCase() || '';
        const nomeOracao = item.oracao?.nomePessoa.toLowerCase() || '';
        const motivoOracao = item.oracao?.motivo?.toLowerCase() || '';
        const localReuniao = item.reuniao?.local.toLowerCase() || '';
        const dataReuniao = item.reuniao?.dataTexto.toLowerCase() || '';
        const tituloGeral = item.geral?.titulo.toLowerCase() || '';
        const descGeral = item.geral?.descricao?.toLowerCase() || '';
        const autor = item.autorNome.toLowerCase();

        return (
          nomeVisitante.includes(query) ||
          cidade.includes(query) ||
          igreja.includes(query) ||
          nomeOracao.includes(query) ||
          motivoOracao.includes(query) ||
          localReuniao.includes(query) ||
          dataReuniao.includes(query) ||
          tituloGeral.includes(query) ||
          descGeral.includes(query) ||
          autor.includes(query)
        );
      }

      return true;
    });
  }, [avisosDaSessao, selectedTipo, statusFiltro, searchTerm]);

  // Formatação da data da sessão
  const dataSessaoFormatada = useMemo(() => {
    if (!sessaoSelecionada?.data) return new Date().toLocaleDateString('pt-BR');
    try {
      const parts = sessaoSelecionada.data.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(sessaoSelecionada.data + 'T12:00:00').toLocaleDateString('pt-BR');
    } catch {
      return sessaoSelecionada.data;
    }
  }, [sessaoSelecionada]);

  // Gerador de Relatório estrito para a sessão selecionada
  const handleCopiarRelatorio = async () => {
    if (!sessaoSelecionada) return;

    const nomeCulto = sessaoSelecionada.nomeCulto || 'Culto de Celebração';
    const dirigente = sessaoSelecionada.dirigenteNome || '';
    const cargoDirigente = sessaoSelecionada.dirigenteCargo
      ? ` (${getCargoLabel(sessaoSelecionada.dirigenteCargo)})`
      : '';

    let relatorio = `📋 *RELATÓRIO DE AVISOS — IPRA AURIFLAMA*\n`;
    relatorio += `⛪ *Culto:* ${nomeCulto}\n`;
    relatorio += `📅 *Data:* ${dataSessaoFormatada}`;
    if (sessaoSelecionada.horarioInicio) {
      relatorio += ` às ${sessaoSelecionada.horarioInicio}`;
    }
    if (dirigente) {
      relatorio += `\n👤 *Dirigente:* ${dirigente}${cargoDirigente}`;
    }
    relatorio += `\n📊 *Total de registros:* ${stats.total} (${stats.anunciados} lidos, ${stats.pendentes} pendentes)\n`;
    relatorio += `----------------------------------------\n\n`;

    const visitantes = avisosDaSessao.filter((a) => a.tipo === 'visitante');
    if (visitantes.length > 0) {
      relatorio += `👤 *VISITANTES (${visitantes.length}):*\n`;
      visitantes.forEach((v, idx) => {
        const origens = [v.visitante?.cidade, v.visitante?.igreja ? `(${v.visitante.igreja})` : '']
          .filter(Boolean)
          .join(' ');
        relatorio += `${idx + 1}. *${v.visitante?.nome}*${origens ? ` - ${origens}` : ''}\n`;
        if (v.visitante?.observacao) relatorio += `   _Obs: ${v.visitante.observacao}_\n`;
      });
      relatorio += `\n`;
    }

    const oracoes = avisosDaSessao.filter((a) => a.tipo === 'oracao');
    if (oracoes.length > 0) {
      relatorio += `🙏 *PEDIDOS DE ORAÇÃO (${oracoes.length}):*\n`;
      oracoes.forEach((o, idx) => {
        relatorio += `${idx + 1}. *${o.oracao?.nomePessoa}* ${o.oracao?.urgente ? '🚨 (Prioridade)' : ''}\n`;
        if (o.oracao?.motivo) {
          relatorio += `   _${o.oracao.motivo}_\n`;
        }
      });
      relatorio += `\n`;
    }

    const reunioes = avisosDaSessao.filter((a) => a.tipo === 'reuniao');
    if (reunioes.length > 0) {
      relatorio += `👥 *REUNIÕES & GRUPOS:*\n`;
      reunioes.forEach((r, idx) => {
        relatorio += `${idx + 1}. *${r.reuniao?.dataTexto}*\n   📍 Local: ${r.reuniao?.local}\n`;
        if (r.reuniao?.responsavel) {
          relatorio += `   👤 Resp: ${r.reuniao.responsavel}\n`;
        }
      });
      relatorio += `\n`;
    }

    const gerais = avisosDaSessao.filter((a) => a.tipo === 'geral');
    if (gerais.length > 0) {
      relatorio += `📢 *COMUNICADOS GERAIS:*\n`;
      gerais.forEach((g, idx) => {
        relatorio += `${idx + 1}. *${g.geral?.titulo}*${g.geral?.dataEvento ? ` (${g.geral.dataEvento})` : ''}\n`;
        if (g.geral?.destinatario) {
          relatorio += `   👥 Público: ${g.geral.destinatario}\n`;
        }
        if (g.geral?.descricao) {
          relatorio += `   ${g.geral.descricao}\n`;
        }
      });
      relatorio += `\n`;
    }

    relatorio += `_Secretaria IPRA Auriflama_`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(relatorio);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = relatorio;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3 space-y-3.5 overflow-x-hidden">
      
      {/* ── SELETOR DE CULTO / SESSÃO DO HISTÓRICO ── */}
      <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        
        {/* Barra superior de seleção da sessão */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Sessão / Culto do Histórico:
            </span>
          </div>

          {historicoCultos.length > 0 ? (
            <select
              value={idSessaoEfetiva}
              onChange={(e) => setCultoSelecionadoId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            >
              {historicoCultos.map((culto) => {
                const isCurrent = culto.id === cultoAtivo?.id && culto.status === 'em_andamento';
                return (
                  <option key={culto.id} value={culto.id}>
                    {isCurrent ? '🟢 [AO VIVO] ' : '🏛️ '}
                    {culto.nomeCulto} ({culto.data || 'Data N/D'})
                  </option>
                );
              })}
            </select>
          ) : (
            <span className="text-xs text-zinc-500 italic">Culto único atual</span>
          )}
        </div>

        {/* Informações detalhadas da sessão selecionada */}
        {sessaoSelecionada ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                  {sessaoSelecionada.nomeCulto}
                </h2>
                {sessaoSelecionada.status === 'em_andamento' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Em andamento
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 border border-zinc-700 text-zinc-400">
                    Encerrado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{dataSessaoFormatada}</span>
                </span>
                {sessaoSelecionada.horarioInicio && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Início às {sessaoSelecionada.horarioInicio}</span>
                    </span>
                  </>
                )}
                {sessaoSelecionada.dirigenteNome && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-zinc-300 font-semibold">{sessaoSelecionada.dirigenteNome}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Botão Copiar Relatório da Sessão */}
            <button
              type="button"
              onClick={handleCopiarRelatorio}
              disabled={avisosDaSessao.length === 0}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-target shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Relatório Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Copiar Relatório</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 py-2 italic text-center">
            Nenhuma sessão de culto selecionada.
          </div>
        )}

        {/* 4 Métricas Sóbrias estritamente da Sessão Selecionada */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-850">
          <div className="bg-black/60 border border-zinc-800/80 p-2 sm:p-2.5 rounded-xl text-center shadow-inner">
            <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
              Visitantes
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.visitantes}</div>
          </div>
          <div className="bg-black/60 border border-zinc-800/80 p-2 sm:p-2.5 rounded-xl text-center shadow-inner">
            <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Orações
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{stats.oracoes}</div>
          </div>
          <div className="bg-black/60 border border-zinc-800/80 p-2 sm:p-2.5 rounded-xl text-center shadow-inner">
            <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
              Reuniões
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">{stats.reunioes}</div>
          </div>
          <div className="bg-black/60 border border-zinc-800/80 p-2 sm:p-2.5 rounded-xl text-center shadow-inner">
            <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
              Gerais
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-300 mt-0.5">{stats.gerais}</div>
          </div>
        </div>
      </div>

      {/* ── BARRA DE BUSCA E FILTROS ── */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por visitante, motivo, local ou autor..."
            className="w-full pl-10 pr-9 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros de Status (Todos / Anunciados / Pendentes) */}
        <div className="flex items-center gap-1.5 no-swipe" data-no-swipe="true">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
          {[
            { id: 'todos' as const, label: `Todos (${stats.total})` },
            { id: 'anunciado' as const, label: `Anunciados (${stats.anunciados})` },
            { id: 'pendente' as const, label: `Pendentes (${stats.pendentes})` },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFiltro(st.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                statusFiltro === st.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Chips de Filtro por Categoria / Tipo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs w-full max-w-full no-swipe" data-no-swipe="true">
          {[
            { id: 'todos', label: 'Todas Categorias' },
            { id: 'visitante', label: 'Visitantes' },
            { id: 'oracao', label: 'Pedidos de Oração' },
            { id: 'reuniao', label: 'Reuniões' },
            { id: 'geral', label: 'Comunicados' },
          ].map((f) => {
            const isSelected = selectedTipo === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedTipo(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all truncate touch-target ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LISTAGEM DE REGISTROS DA SESSÃO ── */}
      {avisosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2 shadow-xs">
          <Search className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {avisosDaSessao.length === 0
              ? 'Nenhum registro transmitido neste culto'
              : 'Nenhum registro encontrado com estes filtros'}
          </div>
          <p className="text-xs text-slate-400">
            {avisosDaSessao.length === 0
              ? 'Os avisos transmitidos para este culto aparecerão catalogados aqui.'
              : 'Tente outro termo de busca ou altere os filtros de status e categoria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {avisosFiltrados.map((aviso) => {
            const isAnunciado = aviso.status === 'anunciado';
            const borderAccent = 
              aviso.tipo === 'visitante' ? 'border-l-indigo-500' :
              aviso.tipo === 'oracao' ? 'border-l-amber-500' :
              aviso.tipo === 'reuniao' ? 'border-l-teal-500' :
              'border-l-blue-500';

            const badgeBg = 
              aviso.tipo === 'visitante' ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
              aviso.tipo === 'oracao' ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
              aviso.tipo === 'reuniao' ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800' :
              'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';

            return (
              <div
                key={aviso.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-l-4 ${borderAccent} rounded-2xl p-4 shadow-xs space-y-2.5 overflow-hidden transition-surface`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                      {getTipoAvisoLabel(aviso.tipo)}
                    </span>
                    {isAnunciado ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Lida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3" /> Pendente
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{formatHora(aviso.criadoEm)}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-slate-600 dark:text-slate-300">{aviso.autorNome.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Detalhes com quebra segura de texto */}
                {aviso.tipo === 'visitante' && aviso.visitante && (
                  <div className="space-y-1">
                    <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white break-words">
                      {aviso.visitante.nome}
                    </div>
                    {[aviso.visitante.cidade, aviso.visitante.igreja].filter(Boolean).length > 0 && (
                      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-words font-medium">
                        {[aviso.visitante.cidade, aviso.visitante.igreja].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    {aviso.visitante.observacao && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 break-words bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        Nota: {aviso.visitante.observacao}
                      </div>
                    )}
                  </div>
                )}

                {aviso.tipo === 'oracao' && aviso.oracao && (
                  <div className="space-y-1">
                    <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white break-words">
                      {aviso.oracao.nomePessoa}
                    </div>
                    {aviso.oracao.motivo && (
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 break-words bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-800/60 leading-relaxed italic">
                        "{aviso.oracao.motivo}"
                      </div>
                    )}
                  </div>
                )}

                {aviso.tipo === 'reuniao' && aviso.reuniao && (
                  <div className="space-y-1">
                    <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white break-words">
                      {aviso.reuniao.dataTexto}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 break-words font-medium">
                      Local: {aviso.reuniao.local}
                    </div>
                    {aviso.reuniao.responsavel && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Responsável: {aviso.reuniao.responsavel}
                      </div>
                    )}
                  </div>
                )}

                {aviso.tipo === 'geral' && aviso.geral && (
                  <div className="space-y-1">
                    <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white break-words">
                      {aviso.geral.titulo}
                    </div>
                    {aviso.geral.destinatario && (
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Público: {aviso.geral.destinatario}
                      </div>
                    )}
                    {aviso.geral.descricao && (
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed mt-1">
                        {aviso.geral.descricao}
                      </div>
                    )}
                    {aviso.geral.dataEvento && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Quando: {aviso.geral.dataEvento}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
