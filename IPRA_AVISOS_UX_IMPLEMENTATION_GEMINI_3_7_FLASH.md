# IPRA Avisos — plano de implementação UX para Gemini 3.7 Flash

# Objetivo

Evoluir o aplicativo `AlexSSCoelho/ipra-avisos` a partir da auditoria do código e de 15 capturas reais do Android, melhorando experiência de usuários leigos, arquitetura de informação, permissões, confiabilidade, navegação mobile, legibilidade e eficiência operacional.

O executor desta especificação é **Gemini 3.7 Flash no Google Antigravity**.

A intenção não é redesenhar o produto por estética. Preserve a identidade visual atual e especialmente a clareza do Púlpito. O P0 já foi encerrado; a continuidade agora é P1 e P2.

# Estado sincronizado de implementação

Este checklist reflete a branch `implementacao-fases` após o commit `e361d90a5455464a3d06070007836ad476529769` e deve permanecer sincronizado com `IPRA_AVISOS_UX_IMPLEMENTATION_CLAUDE_SONNET_4_6.md`.

## P0 — integridade e autorização — CONCLUÍDO

- [x] remover dados demo/fallbacks fictícios de produção;
- [x] remover autoidentificação como primeiro obreiro;
- [x] limitar swipe global e respeitar controles/`no-swipe`;
- [x] persistir o horário real escolhido para novo culto;
- [x] métricas da Home usam o culto atual;
- [x] relatório P0 não mistura avisos globais com a data do culto;
- [x] `setDirigenteDoCulto()` não cria culto por rota indireta;
- [x] PIN padrão/fallback `1234` removido;
- [x] bootstrap explícito para primeira instalação;
- [x] `isAdmin` depende de permissão explícita;
- [x] migração legada promove apenas registros com `isAdmin` ausente, preservando `isAdmin: false`;
- [x] `currentUser` sincroniza com registro migrado;
- [x] cadastro comum de obreiros saiu da identificação e não possui bypass público;
- [x] instalação existente com administrador e sem PIN pode configurar primeiro PIN por fluxo explícito;
- [x] dirigente atual se identifica sem redigitar PIN quando não há troca real;
- [x] troca real de dirigente continua autorizada;
- [x] `finalizarCulto()` falha sem culto em andamento ou com culto já finalizado;
- [x] exclusão/cancelamento de aviso pendente respeita autor/status/permissão;
- [x] aviso anunciado não é apagado pelo fluxo comum;
- [x] PIN administrativo é numérico, com mínimo de 4 dígitos;
- [x] terminologia administrativa foi padronizada, sem “PIN Master”.

**P0 é baseline estável. Não reabrir P0 salvo regressão concreta reproduzida durante P1/P2.**

## P1 — arquitetura de informação e experiência mobile — CONCLUÍDO

- [x] tornar navegação orientada à tarefa;
- [x] simplificar Home e remover duplicações;
- [x] reduzir cabeçalho fixo;
- [x] separar Preferências de Administração;
- [x] clarificar identificação versus autenticação;
- [x] refinar linguagem operacional e remover termos técnicos/ambíguos.

## P2 — formulários, histórico e refinamento

- [ ] não fabricar valores de campos opcionais;
- [ ] simplificar formulário de reunião;
- [ ] persistir datas absolutas em vez de expressões relativas;
- [ ] revisar opções que não afetam Púlpito/Histórico/relatórios;
- [ ] melhorar edição/desfazer de aviso pendente;
- [ ] implementar Histórico real por culto/sessão;
- [ ] criar modo focado de Púlpito;
- [ ] refinar densidade visual, tipografia, motion e acessibilidade sem trocar identidade.

# Handoff obrigatório para P1/P2

Antes de implementar, leia `IPRA_AVISOS_P1_P2_HANDOFF_GEMINI_3_7_FLASH.md`.

Esse arquivo registra:

- baseline técnico atual do P0;
- invariantes que não podem regredir;
- estado arquitetural de `App`, `Header`, `Home`, `Settings`, formulários, Histórico e Púlpito;
- ordem recomendada de execução de P1 e P2;
- critérios observáveis por fase;
- riscos de compatibilidade/migração.

Não reconstrua essas decisões do zero sem evidência de que o código atual divergiu do handoff.

# Contexto relevante

O IPRA Avisos é React + TypeScript + Vite, empacotável via Capacitor para Android. Persistência/sincronização usa `localStorage`, `BroadcastChannel` e Firestore opcional. Offline-first deve ser preservado.

Usuários/tarefas principais:

1. **Recepção / Diaconia** — registrar aviso rapidamente e confirmar que chegou ao Púlpito.
2. **Dirigente / Púlpito** — ler pendências, marcar como anunciado e recuperar enganos.
3. **Administração** — iniciar/encerrar culto, definir dirigente, gerenciar obreiros, consultar histórico e configurar o sistema.

Fluxo central: **registrar → chegar ao Púlpito → anunciar → registrar como concluído**.

Preserve:

- identidade azul-marinho/branco/âmbar;
- cores de categoria;
- hierarquia e legibilidade do Púlpito;
- separação conceitual Anotação/Púlpito/Histórico;
- offline-first;
- regras de autorização e migração concluídas no P0.

# Problema central de P1/P2

A interface está visualmente mais madura do que sua arquitetura de informação. Funções repetidas aparecem em cabeçalho, Home, atalhos, perfil e Ajustes. Isso aumenta carga cognitiva e consome espaço vertical em celular.

P1 resolve arquitetura de informação e chrome. P2 melhora captura de dados, Histórico, modo focado de Púlpito e polish.

# P1 — arquitetura de informação e experiência mobile

## Navegação orientada à tarefa

Recepção/diaconia deve chegar à Anotação com mínima fricção; dirigente ao Púlpito; administração a Home/Histórico/Administração. Uma pessoa pode acumular funções, portanto evite hard-hiding desnecessário.

Avalie bottom navigation versus estrutura atual no render real. Não implemente por tendência. Máximo de quatro destinos primários, ícone+rótulo e estado ativo inequívoco.

## Simplificar Home

A Home deve responder:

1. qual culto está ativo;
2. qual é meu contexto;
3. qual ação provavelmente preciso executar.

Remova atalhos que apenas repetem a navegação, limite ações secundárias, mova instalação/download para área secundária e preserve métricas do culto atual.

## Reduzir cabeçalho fixo

Preserve contexto essencial do culto e pendências. Reduza chrome, duplicações e truncamentos em largura próxima de 360 px.

## Separar Preferências de Administração

Organização esperada:

- Preferências: som, tema, fonte, app;
- Identificação: usuário atual/troca;
- Administração do culto: dirigente/iniciar/encerrar;
- Pessoas: obreiros/permissões;
- Segurança: PIN administrativo;
- Sistema avançado: sincronização/diagnóstico.

Firebase/runtime config não deve competir com preferências comuns.

## Identificação versus autenticação

Seleção de nome é identificação operacional, não login seguro. Não transforme P1 em sistema de contas. Ações privilegiadas continuam protegidas pelo P0.

## Linguagem operacional

Use termos compreensíveis para usuário leigo. Preserve “Administrador/PIN administrativo”. Se uma ação apenas copia texto, use “Copiar relatório”; não prometa “WhatsApp” ou “guarda permanente” sem comportamento correspondente. Pendentes devem usar linguagem como “Aguardando anúncio”/“Enviado ao púlpito”.

# P2 — formulários, histórico e refinamento

## Campos opcionais

Não transformar ausência de cidade/igreja em fatos presumidos.

## Reunião

Hierarquia: **Qual reunião? → Quando? → Onde? → Responsável**. Pode continuar numa tela; use progressive disclosure somente quando reduzir carga cognitiva.

## Datas

Persistir datas absolutas e renderizar texto amigável. Preserve compatibilidade com registros antigos.

## Campos sem efeito

Antes de remover ou tornar opcional, confirme uso em Púlpito, Histórico, filtros, relatório ou regra.

## Correção de aviso pendente

Pode haver edição/desfazer enquanto pendente, sem permitir apagar/editar anunciado sem nova decisão de produto.

## Histórico por culto

Implementar lista de sessões por data/nome/dirigente/quantidade e detalhe por culto. Métricas, busca, filtros e relatório devem respeitar a sessão selecionada.

Se o storage atual não guardar catálogo suficiente de cultos finalizados, implemente a menor extensão de domínio necessária, com migração/compatibilidade consciente.

## Púlpito focado

Preserve os cards e sua legibilidade. Reduza apenas o chrome ao redor do modo de leitura: culto/status, pendentes, fonte, Para Ler/Já Lidos e saída clara.

## Refinamento visual

Somente após fluxos corretos: reduzir containers/badges/sombras sem função, corrigir texto crítico pequeno, garantir touch targets próximos de 44 px e considerar `prefers-reduced-motion`.

# Regras de implementação

1. Leia o estado atual da branch antes de editar.
2. Leia o handoff P1/P2 antes de planejar.
3. Não trate documentos como substitutos do código real.
4. P0 é baseline; preserve seus invariantes.
5. Implemente por fases e commits revisáveis.
6. Preserve offline-first e dados reais existentes.
7. Mudança de schema exige compatibilidade/migração.
8. Não introduza backend, framework, UI library ou state manager sem necessidade direta.
9. Não transforme o app em dashboard genérico.
10. Não reduza legibilidade do Púlpito.
11. Não adicione motion decorativo.
12. Fatos descobríveis no repo devem ser investigados, não perguntados.
13. Decisões que alterem permissões, significado dos dados ou fluxo do culto são bloqueantes e devem ser confirmadas.

# Execução

## Fase 2 — P1 arquitetura mobile

Inspecione `App.tsx`, `Header.tsx`, `HomeScreen.tsx`, `SettingsModal.tsx`, `LoginScreen.tsx` e destinos de navegação. Produza plano curto, implemente P1, valide render e atualize checklists antes de P2.

## Fase 3 — P2A captura

Formulários, datas/horários, defaults e recuperação/edição de pendentes.

## Fase 4 — P2B/P2C Histórico e Púlpito

Histórico por culto e modo focado de leitura.

## Fase 5 — P2D polish

Densidade, tipografia, motion, mensagens e acessibilidade. Não usar como oportunidade para redesign total.

# Validação

Sempre executar:

```bash
npm run lint
npm run build
```

Para P1 e P2 visual, inspecionar render em aproximadamente 360 px e em viewport maior. Build/lint não substituem validação visual.

Após cada fase, revalidar amostra dos invariantes P0: identificação, admin/PIN, troca de dirigente, início/encerramento, registro de aviso, chegada ao Púlpito, anúncio/desfazer e cancelamento de pendente.

Cenários adicionais conforme avanço:

- P1: navegação por contexto, Home simplificada, Header compacto, Settings organizado, sem perda de acesso para usuários com papéis acumulados;
- P2A: quatro tipos de aviso, opcionais vazios, data absoluta, edição/desfazer pendente;
- P2B: pelo menos dois cultos no Histórico, métricas/filtros/relatório por sessão;
- P2C: Púlpito focado com fonte, Para Ler/Já Lidos, cards e saída clara;
- P2D: tema claro/escuro, fonte aumentada, teclado, reduced motion e 360 px.

# Critério de pronto

O plano só termina quando P1 e P2 estiverem concluídos, `npm run lint` e `npm run build` passarem, fluxos críticos forem validados no render real, P0 permanecer sem regressões e a identidade visual do IPRA Avisos estiver preservada.

---

# Registro de Conclusão da Fase P2 (Gemini 3.7 Flash)

A Fase P2 foi totalmente executada e validada, com commits atômicos por subfase:

## Subfases Executadas:

### 1. P2A — Formulários, Dados, Edição de Pendentes e Roster Real IPRA
- **Status:** CONCLUÍDO (Commit `b4183b7`)
- **Arquivos:** `types/index.ts`, `data/initialObreiros.ts`, `services/storageService.ts`, `utils/formatters.ts`, `context/AvisosContext.tsx`, `components/diacono/FormVisitante.tsx`, `components/diacono/FormReuniao.tsx`, `components/diacono/FormOracao.tsx`, `components/diacono/FormAvisoGeral.tsx`, `components/diacono/EditarAvisoModal.tsx`, `components/diacono/MeusAvisosHoje.tsx`, `components/pulpito/AvisoCardPulpito.tsx`, `components/historico/HistoricoScreen.tsx`.
- **Entregas:**
  - Removidos fallbacks artificiais em visitantes (cidade/igreja vazias permanecem `undefined`), orações (motivo opcional sem frases fabricadas) e geral.
  - Reunião reorganizada com sequência cognitiva (Qual reunião? → Quando? → Onde? → Responsável) e persistência de `dataIso` absoluta e texto amigável.
  - Edição ágil e segura de avisos pendentes com modal dedicado e checagem de permissões (autor, dirigente, admin).
  - Cards e relatórios atualizados sem pontuações órfãs (` • ` ou `()`).
  - Relação oficial de obreiros reais da IPRA Auriflama implementada por recomendação direta do usuário (Alex Coelho como Master Admin, Pr. Cláudio Lísias e Diác. Júlio Coelho como Admins, e Menção Honrosa para os pastores eméritos José Roberto Moraes e Israel Firmino).

### 2. P2B — Catálogo de Cultos, Seleção de Sessão e Histórico Isolado
- **Status:** CONCLUÍDO (Commit `56db9d2`)
- **Arquivos:** `services/storageService.ts`, `context/CultoContext.tsx`, `components/historico/HistoricoScreen.tsx`.
- **Entregas:**
  - Catálogo de sessões passadas persistido em `ipra_historico_cultos_v1` com reconciliação retrocompatível de avisos antigos.
  - Seletor de Sessão / Culto no topo do Histórico com indicativo visual de culto ao vivo ou encerrado.
  - Métricas (visitantes, orações, reuniões, gerais, pendentes e anunciados), busca em tempo real, filtros de status/categoria e gerador de relatório do WhatsApp restritos estritamente à sessão selecionada.

### 3. P2C — Modo Focado Imersivo do Púlpito
- **Status:** CONCLUÍDO (Commit `dcc6ab0`)
- **Arquivos:** `context/AccessibilityContext.tsx`, `App.tsx`, `components/pulpito/PulpitoScreen.tsx`.
- **Entregas:**
  - Modo focado do Púlpito com retração total de Header e BottomNav para maximizar área útil vertical.
  - Barra compacta com controles rápidos de fonte (A-, 100%, A+), identificação do culto/dirigente e botão evidente de saída (além da tecla Escape).
  - Bloqueio de troca acidental de abas por swipe horizontal enquanto em modo imersivo.

### 4. P2D — Refinamento Visual, Motion e Acessibilidade Mobile
- **Status:** CONCLUÍDO (Commit `8f46223`)
- **Arquivos:** `src/index.css`.
- **Entregas:**
  - Suporte estrito a `@media (prefers-reduced-motion: reduce)` anulando durações de animações e transições.
  - Alvos de toque com área mínima de 44x44px em `.touch-target`.
  - Tipografia de inputs calibrada para 16px no mobile, evitando auto-zoom no Safari iOS.

### 5. P2E — Sincronização Documental
- **Status:** CONCLUÍDO
- **Validações:** `npm run lint` (0 erros) e `npm run build` (sucesso limpo em 1856 módulos).

