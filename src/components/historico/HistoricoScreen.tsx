import React, { useState, useMemo } from 'react';
import { 
  Archive, 
  Search, 
  Check, 
  Clock, 
  Share2,
  X
} from 'lucide-react';
import { useAvisos } from '../../context/AvisosContext';
import { formatHora, getCargoLabel, getTipoAvisoLabel } from '../../utils/formatters';
import type { TipoAviso } from '../../types';

export const HistoricoScreen: React.FC = () => {
  const { avisos } = useAvisos();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoAviso | 'todos'>('todos');
  const [copied, setCopied] = useState(false);

  const avisosFiltrados = useMemo(() => {
    return avisos.filter((item) => {
      if (selectedTipo !== 'todos' && item.tipo !== selectedTipo) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nomeVisitante = item.visitante?.nome.toLowerCase() || '';
        const cidade = item.visitante?.cidade.toLowerCase() || '';
        const igreja = item.visitante?.igreja.toLowerCase() || '';
        const nomeOracao = item.oracao?.nomePessoa.toLowerCase() || '';
        const motivoOracao = item.oracao?.motivo.toLowerCase() || '';
        const localReuniao = item.reuniao?.local.toLowerCase() || '';
        const tituloGeral = item.geral?.titulo.toLowerCase() || '';
        const autor = item.autorNome.toLowerCase();

        return (
          nomeVisitante.includes(query) ||
          cidade.includes(query) ||
          igreja.includes(query) ||
          nomeOracao.includes(query) ||
          motivoOracao.includes(query) ||
          localReuniao.includes(query) ||
          tituloGeral.includes(query) ||
          autor.includes(query)
        );
      }

      return true;
    });
  }, [avisos, selectedTipo, searchTerm]);

  const stats = useMemo(() => {
    const visitantes = avisos.filter((a) => a.tipo === 'visitante').length;
    const oracoes = avisos.filter((a) => a.tipo === 'oracao').length;
    const reunioes = avisos.filter((a) => a.tipo === 'reuniao').length;
    const gerais = avisos.filter((a) => a.tipo === 'geral').length;
    return { visitantes, oracoes, reunioes, gerais, total: avisos.length };
  }, [avisos]);

  const handleCopiarRelatorio = () => {
    let relatorio = `📋 *RELATÓRIO DE AVISOS — IPRA AURIFLAMA*\n`;
    relatorio += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    relatorio += `----------------------------------------\n\n`;

    const visitantes = avisos.filter((a) => a.tipo === 'visitante');
    if (visitantes.length > 0) {
      relatorio += `👤 *VISITANTES (${visitantes.length}):*\n`;
      visitantes.forEach((v, idx) => {
        relatorio += `${idx + 1}. *${v.visitante?.nome}* - ${v.visitante?.cidade} (${v.visitante?.igreja})\n`;
        if (v.visitante?.observacao) relatorio += `   _Obs: ${v.visitante.observacao}_\n`;
      });
      relatorio += `\n`;
    }

    const oracoes = avisos.filter((a) => a.tipo === 'oracao');
    if (oracoes.length > 0) {
      relatorio += `🙏 *PEDIDOS DE ORAÇÃO (${oracoes.length}):*\n`;
      oracoes.forEach((o, idx) => {
        relatorio += `${idx + 1}. *${o.oracao?.nomePessoa}* ${o.oracao?.urgente ? '🚨 (Prioridade)' : ''}\n   _${o.oracao?.motivo}_\n`;
      });
      relatorio += `\n`;
    }

    const reunioes = avisos.filter((a) => a.tipo === 'reuniao');
    if (reunioes.length > 0) {
      relatorio += `👥 *REUNIÕES & GRUPOS:*\n`;
      reunioes.forEach((r, idx) => {
        relatorio += `${idx + 1}. *${r.reuniao?.dataTexto}*\n   📍 Local: ${r.reuniao?.local}\n`;
      });
      relatorio += `\n`;
    }

    const gerais = avisos.filter((a) => a.tipo === 'geral');
    if (gerais.length > 0) {
      relatorio += `📢 *COMUNICADOS GERAIS:*\n`;
      gerais.forEach((g, idx) => {
        relatorio += `${idx + 1}. *${g.geral?.titulo}* (${g.geral?.dataEvento || 'Geral'})\n   ${g.geral?.descricao}\n`;
      });
      relatorio += `\n`;
    }

    relatorio += `_Secretaria IPRA Auriflama_`;

    navigator.clipboard.writeText(relatorio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3 space-y-3 overflow-x-hidden">
      
      {/* Header do Histórico */}
      <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400" />
              <span>Arquivo Histórico de Registros</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Guarda permanente dos comunicados da IPRA
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopiarRelatorio}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar para WhatsApp</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Métricas Sóbrias e Compactas */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-850">
          <div className="bg-black/60 border border-zinc-800/80 p-2 rounded-xl text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Visitantes</div>
            <div className="text-lg font-extrabold text-white mt-0.5">{stats.visitantes}</div>
          </div>
          <div className="bg-black/60 border border-zinc-800/80 p-2 rounded-xl text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Orações</div>
            <div className="text-lg font-extrabold text-amber-300 mt-0.5">{stats.oracoes}</div>
          </div>
          <div className="bg-black/60 border border-zinc-800/80 p-2 rounded-xl text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-teal-400">Reuniões</div>
            <div className="text-lg font-extrabold text-teal-300 mt-0.5">{stats.reunioes}</div>
          </div>
          <div className="bg-black/60 border border-zinc-800/80 p-2 rounded-xl text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Avisos</div>
            <div className="text-lg font-extrabold text-blue-300 mt-0.5">{stats.gerais}</div>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por visitante, motivo ou obreiro..."
            className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-zinc-800 bg-[#0f1117] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chips de Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs w-full max-w-full">
          {[
            { id: 'todos', label: 'Todos os Registros' },
            { id: 'visitante', label: 'Visitantes' },
            { id: 'oracao', label: 'Pedidos de Oração' },
            { id: 'reuniao', label: 'Reuniões' },
            { id: 'geral', label: 'Comunicados' },
          ].map((f) => {
            const isSelected = selectedTipo === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedTipo(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 border transition-all truncate ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-transparent shadow-xs'
                    : 'bg-[#0f1117] border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Registros */}
      {avisosFiltrados.length === 0 ? (
        <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 space-y-1.5">
          <Search className="w-6 h-6 mx-auto text-zinc-500 opacity-60" />
          <div className="font-semibold text-xs text-zinc-200">
            Nenhum registro localizado
          </div>
          <p className="text-[10px] text-zinc-500">Tente outro termo de busca ou altere o filtro acima.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {avisosFiltrados.map((aviso) => {
            return (
              <div
                key={aviso.id}
                className="bg-[#0f1117] border border-zinc-800 rounded-xl p-3 shadow-xs space-y-1.5 overflow-hidden"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className={`font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded border ${
                    aviso.tipo === 'visitante' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800' :
                    aviso.tipo === 'oracao' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                    aviso.tipo === 'reuniao' ? 'bg-teal-950/80 text-teal-300 border-teal-800' :
                    'bg-blue-950/80 text-blue-300 border-blue-800'
                  }`}>
                    {getTipoAvisoLabel(aviso.tipo)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{formatHora(aviso.criadoEm)}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300">{aviso.autorNome.split(' ')[0]} ({getCargoLabel(aviso.autorCargo)})</span>
                  </div>
                </div>

                {/* Detalhes com quebra segura de texto */}
                {aviso.tipo === 'visitante' && aviso.visitante && (
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-white break-words">
                      {aviso.visitante.nome}
                    </div>
                    <div className="text-xs text-zinc-400 break-words">
                      {aviso.visitante.cidade} • {aviso.visitante.igreja}
                    </div>
                    {aviso.visitante.observacao && (
                      <div className="text-xs text-zinc-300 italic mt-0.5 break-words">
                        Nota: {aviso.visitante.observacao}
                      </div>
                    )}
                  </div>
                )}

                {aviso.tipo === 'oracao' && aviso.oracao && (
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-amber-300 break-words">
                      {aviso.oracao.nomePessoa}
                    </div>
                    <div className="text-xs text-zinc-200 break-words">
                      "{aviso.oracao.motivo}"
                    </div>
                  </div>
                )}

                {aviso.tipo === 'reuniao' && aviso.reuniao && (
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-teal-300 break-words">
                      {aviso.reuniao.dataTexto}
                    </div>
                    <div className="text-xs text-zinc-400 break-words">
                      Local: {aviso.reuniao.local}
                    </div>
                  </div>
                )}

                {aviso.tipo === 'geral' && aviso.geral && (
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-blue-300 break-words">
                      {aviso.geral.titulo}
                    </div>
                    <div className="text-xs text-zinc-300 break-words">
                      {aviso.geral.descricao}
                    </div>
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
