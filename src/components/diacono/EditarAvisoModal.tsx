import React, { useState } from 'react';
import { X, CheckCircle2, Save, AlertTriangle, User, Heart, CalendarDays, Megaphone } from 'lucide-react';
import type { AvisoItem, GrupoReuniao, CategoriaOracao } from '../../types';
import { useAvisos } from '../../context/AvisosContext';
import { getTipoAvisoLabel, formatarDataIsoAmigavel } from '../../utils/formatters';

interface EditarAvisoModalProps {
  isOpen: boolean;
  aviso: AvisoItem | null;
  onClose: () => void;
}

const EditarAvisoForm: React.FC<{ aviso: AvisoItem; onClose: () => void }> = ({ aviso, onClose }) => {
  const { editarAviso } = useAvisos();

  // Estados locais inicializados diretamente a partir das props
  // 1. Visitante
  const [visNome, setVisNome] = useState(aviso.visitante?.nome || '');
  const [visGenero, setVisGenero] = useState<'homem' | 'mulher' | 'casal' | 'crianca' | 'familia'>(
    aviso.visitante?.genero || 'homem'
  );
  const [visCidade, setVisCidade] = useState(aviso.visitante?.cidade || '');
  const [visIgreja, setVisIgreja] = useState(aviso.visitante?.igreja || '');
  const [visObs, setVisObs] = useState(aviso.visitante?.observacao || '');

  // 2. Oração
  const [oraNome, setOraNome] = useState(aviso.oracao?.nomePessoa || '');
  const [oraCategoria, setOraCategoria] = useState<CategoriaOracao>(aviso.oracao?.categoria || 'saude');
  const [oraMotivo, setOraMotivo] = useState(aviso.oracao?.motivo || '');
  const [oraUrgente, setOraUrgente] = useState(aviso.oracao?.urgente || false);

  // 3. Reunião (campos estruturados com dataIso, horario e compatibilidade legada)
  const [reuGrupo, setReuGrupo] = useState<GrupoReuniao>(aviso.reuniao?.grupo || 'oracao_casas');
  const [reuGrupoNome, setReuGrupoNome] = useState(aviso.reuniao?.grupoNomePersonalizado || '');
  const [reuDataIso, setReuDataIso] = useState<string>(aviso.reuniao?.dataIso || '');
  const [reuDataTextoLegado] = useState<string>(
    aviso.reuniao?.dataIso ? '' : (aviso.reuniao?.dataTexto || '')
  );
  const [reuHorario, setReuHorario] = useState<string>(aviso.reuniao?.horario || '');
  const [reuLocal, setReuLocal] = useState<string>(aviso.reuniao?.local || '');
  const [reuResponsavel, setReuResponsavel] = useState<string>(aviso.reuniao?.responsavel || '');

  // 4. Geral
  const [gerTitulo, setGerTitulo] = useState(aviso.geral?.titulo || '');
  const [gerDestinatario, setGerDestinatario] = useState(aviso.geral?.destinatario || '');
  const [gerDescricao, setGerDescricao] = useState(aviso.geral?.descricao || '');
  const [gerDataEvento, setGerDataEvento] = useState(aviso.geral?.dataEvento || '');

  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let res: { success: boolean; message?: string };

    if (aviso.tipo === 'visitante') {
      if (!visNome.trim()) {
        setErrorMsg('Informe o nome do visitante.');
        return;
      }
      res = editarAviso(aviso.id, {
        visitante: {
          nome: visNome.trim(),
          genero: visGenero,
          cidade: visCidade.trim() || undefined,
          igreja: visIgreja.trim() || undefined,
          observacao: visObs.trim() || undefined,
        },
      });
    } else if (aviso.tipo === 'oracao') {
      if (!oraNome.trim()) {
        setErrorMsg('Informe o nome da pessoa para oração.');
        return;
      }
      res = editarAviso(aviso.id, {
        oracao: {
          nomePessoa: oraNome.trim(),
          categoria: oraCategoria,
          motivo: oraMotivo.trim() || undefined,
          urgente: oraUrgente,
        },
      });
    } else if (aviso.tipo === 'reuniao') {
      if (!reuLocal.trim()) {
        setErrorMsg('Informe o local da reunião.');
        return;
      }
      if (!reuDataIso && !reuDataTextoLegado.trim()) {
        setErrorMsg('Informe a data da reunião.');
        return;
      }

      let dataIsoFinal: string | undefined = undefined;
      let dataTextoFinal: string = '';

      if (reuDataIso) {
        dataIsoFinal = reuDataIso;
        const amigavel = formatarDataIsoAmigavel(reuDataIso);
        dataTextoFinal = reuHorario.trim() ? `${amigavel} às ${reuHorario.trim()}` : amigavel;
      } else {
        dataTextoFinal = reuDataTextoLegado.trim() || aviso.reuniao?.dataTexto || '';
      }

      res = editarAviso(aviso.id, {
        reuniao: {
          grupo: reuGrupo,
          grupoNomePersonalizado: reuGrupo === 'outro' ? reuGrupoNome.trim() || undefined : undefined,
          dataIso: dataIsoFinal,
          dataTexto: dataTextoFinal,
          horario: reuHorario.trim(),
          local: reuLocal.trim(),
          responsavel: reuResponsavel.trim() || undefined,
        },
      });
    } else {
      if (!gerTitulo.trim()) {
        setErrorMsg('Informe o título do comunicado.');
        return;
      }
      res = editarAviso(aviso.id, {
        geral: {
          titulo: gerTitulo.trim(),
          destinatario: gerDestinatario.trim() || undefined,
          descricao: gerDescricao.trim() || undefined,
          dataEvento: gerDataEvento.trim() || undefined,
        },
      });
    }

    if (!res.success) {
      setErrorMsg(res.message || 'Erro ao salvar alterações.');
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 600);
  };

  const getItemIcon = () => {
    switch (aviso.tipo) {
      case 'visitante':
        return <User className="w-4 h-4 text-indigo-500" />;
      case 'oracao':
        return <Heart className="w-4 h-4 text-amber-500" />;
      case 'reuniao':
        return <CalendarDays className="w-4 h-4 text-teal-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
      {/* Topo do Modal */}
      <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
            {getItemIcon()}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white leading-tight">
              Editar {getTipoAvisoLabel(aviso.tipo)}
            </h3>
            <p className="text-[10px] text-slate-400">Aviso pendente no Púlpito</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {showSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Aviso atualizado com sucesso!</span>
          </div>
        )}

        {/* 1. CAMPOS PARA VISITANTE */}
        {aviso.tipo === 'visitante' && (
          <>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nome do Visitante: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={visNome}
                onChange={(e) => setVisNome(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Composição:
              </label>
              <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'homem' as const, label: 'Homem' },
                  { id: 'mulher' as const, label: 'Mulher' },
                  { id: 'casal' as const, label: 'Casal' },
                  { id: 'familia' as const, label: 'Família' },
                  { id: 'crianca' as const, label: 'Jovem' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVisGenero(item.id)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${
                      visGenero === item.id
                        ? 'bg-slate-800 text-indigo-300 ring-1 ring-indigo-500/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cidade de Origem (Opcional):
              </label>
              <input
                type="text"
                value={visCidade}
                onChange={(e) => setVisCidade(e.target.value)}
                placeholder="Ex: Auriflama, Jales..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Igreja de Origem (Opcional):
              </label>
              <input
                type="text"
                value={visIgreja}
                onChange={(e) => setVisIgreja(e.target.value)}
                placeholder="Ex: IPRA Central, Primeira Visita..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Observação / Convidado de quem? (Opcional):
              </label>
              <input
                type="text"
                value={visObs}
                onChange={(e) => setVisObs(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
          </>
        )}

        {/* 2. CAMPOS PARA ORAÇÃO */}
        {aviso.tipo === 'oracao' && (
          <>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nome da Pessoa ou Família: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={oraNome}
                onChange={(e) => setOraNome(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Categoria da Intercessão:
              </label>
              <select
                value={oraCategoria}
                onChange={(e) => setOraCategoria(e.target.value as CategoriaOracao)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="saude">Saúde & Tratamento</option>
                <option value="familia">Família & Lar</option>
                <option value="causas">Trabalho & Causas</option>
                <option value="espiritual">Vida Espiritual</option>
                <option value="agradecimento">Ação de Graças</option>
                <option value="luto">Consolo no Luto</option>
                <option value="outro">Outro Motivo</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Motivo da Oração / Detalhes (Opcional):
              </label>
              <textarea
                rows={2}
                value={oraMotivo}
                onChange={(e) => setOraMotivo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oraUrgente}
                  onChange={(e) => setOraUrgente(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700"
                />
                <span className="text-xs font-bold text-slate-200">
                  Marcar como prioridade urgente no Púlpito
                </span>
              </label>
            </div>
          </>
        )}

        {/* 3. CAMPOS PARA REUNIÃO */}
        {aviso.tipo === 'reuniao' && (
          <>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Grupo / Encontro:
              </label>
              <select
                value={reuGrupo}
                onChange={(e) => setReuGrupo(e.target.value as GrupoReuniao)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-teal-400"
              >
                <option value="oracao_casas">Culto de Oração nos Lares</option>
                <option value="irmas">Círculo de Oração (Irmãs)</option>
                <option value="varoes">Reunião de Varões</option>
                <option value="jovens">Juventude & Mocidade (UMERP)</option>
                <option value="ensaio">Ensaio de Louvor / Coral</option>
                <option value="criancas">Culto Infantil / EBD</option>
                <option value="outro">Outra Reunião</option>
              </select>
            </div>

            {reuGrupo === 'outro' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nome do Encontro Personalizado:
                </label>
                <input
                  type="text"
                  value={reuGrupoNome}
                  onChange={(e) => setReuGrupoNome(e.target.value)}
                  placeholder="Nome do encontro"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            )}

            {/* Data e Horário Estruturados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Data do Encontro: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={reuDataIso}
                  onChange={(e) => setReuDataIso(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                />
                {reuDataIso ? (
                  <div className="text-[10px] text-teal-400 font-semibold mt-1">
                    {formatarDataIsoAmigavel(reuDataIso)}
                  </div>
                ) : reuDataTextoLegado ? (
                  <div className="text-[10px] text-amber-400 font-medium mt-1">
                    Data registrada: {reuDataTextoLegado}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Horário (Opcional):
                </label>
                <input
                  type="text"
                  value={reuHorario}
                  onChange={(e) => setReuHorario(e.target.value)}
                  placeholder="Ex: 19h30, 20h00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Local ou Endereço: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reuLocal}
                onChange={(e) => setReuLocal(e.target.value)}
                placeholder="Ex: No Templo da IPRA"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Responsável / Liderança (Opcional):
              </label>
              <input
                type="text"
                value={reuResponsavel}
                onChange={(e) => setReuResponsavel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
          </>
        )}

        {/* 4. CAMPOS PARA GERAL */}
        {aviso.tipo === 'geral' && (
          <>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assunto / Título: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={gerTitulo}
                onChange={(e) => setGerTitulo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Público / Destinatário (Opcional):
              </label>
              <input
                type="text"
                value={gerDestinatario}
                onChange={(e) => setGerDestinatario(e.target.value)}
                placeholder="Ex: Toda a Igreja, Liderança, Juventude..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Descrição dos Detalhes (Opcional):
              </label>
              <textarea
                rows={2}
                value={gerDescricao}
                onChange={(e) => setGerDescricao(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Data de Realização (Opcional):
              </label>
              <input
                type="text"
                value={gerDataEvento}
                onChange={(e) => setGerDataEvento(e.target.value)}
                placeholder="Ex: Próximo Domingo pela manhã"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>
          </>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2.5 pt-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 touch-target"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export const EditarAvisoModal: React.FC<EditarAvisoModalProps> = ({
  isOpen,
  aviso,
  onClose,
}) => {
  if (!isOpen || !aviso) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <EditarAvisoForm key={aviso.id} aviso={aviso} onClose={onClose} />
    </div>
  );
};
