# IPRA Avisos — handoff de P1/P2 para Gemini 3.7 Flash no Antigravity

# Objetivo

Continuar a implementação do IPRA Avisos a partir do P0 já concluído na branch `implementacao-fases`, sem reabrir decisões de integridade/autorização que já foram corrigidas e validadas.

O executor é **Gemini 3.7 Flash no Google Antigravity**.

Use este arquivo em conjunto com `IPRA_AVISOS_UX_IMPLEMENTATION_GEMINI_3_7_FLASH.md`. O plano principal continua sendo a fonte de requisitos; este handoff registra o estado real de partida e reduz o risco de o agente reconstruir contexto incorretamente.

# Baseline atual

Branch: `implementacao-fases`

Baseline de P0 encerrado: `e361d90a5455464a3d06070007836ad476529769`

O P0 está encerrado. Não refaça bootstrap, autorização, PIN, escopo do culto, swipe, horário ou regras de exclusão de aviso salvo se uma regressão concreta causada por P1/P2 for reproduzida.

## Invariantes de P0 que devem permanecer

- instalação nova começa sem dados fictícios;
- primeiro uso usa bootstrap explícito do primeiro administrador;
- não existe PIN padrão/fallback `1234`;
- PIN administrativo é numérico e tem no mínimo 4 dígitos;
- `isAdmin` é permissão explícita; cargo não concede administração em novos registros;
- migração legada só promove registros antigos quando `isAdmin` estava realmente ausente, preservando `isAdmin: false`;
- `currentUser` é sincronizado com o registro migrado correspondente;
- `addObreiro()` normal não possui bypass público;
- bootstrap usa operação específica e não pode ser repetido em instalação configurada;
- instalação existente com administrador e sem PIN possui fluxo explícito para configurar o primeiro PIN;
- dirigente já definido pode se identificar sem redigitar PIN; troca real de dirigente continua autorizada;
- `setDirigenteDoCulto()` nunca cria culto;
- apenas administrador inicia novo culto;
- apenas dirigente atual ou administrador encerra culto em andamento;
- encerrar sem culto ou culto já finalizado retorna falha;
- horário escolhido no início do culto é persistido;
- métricas da Home e avisos do Púlpito usam o culto atual;
- relatório P0 não mistura cultos;
- swipe global foi endurecido e respeita controles/`no-swipe`;
- autor pode cancelar o próprio aviso pendente; dirigente/admin podem cancelar pendente conforme regra; anunciado não é apagado pelo fluxo comum.

# Estado arquitetural que P1 encontrará

Confirme no código antes de editar, mas parta destas observações já auditadas.

## `src/App.tsx`

A navegação histórica do app usa quatro destinos principais — Início, Anotação, Púlpito e Histórico — e as telas ficam montadas em uma estrutura horizontal. O swipe foi corrigido no P0, mas a arquitetura ainda expõe todos os módulos de forma muito semelhante para todos os perfis.

P1 deve reduzir distração e priorizar tarefa sem criar segregação rígida por papel, porque uma pessoa pode acumular funções.

## `src/components/common/Header.tsx`

O cabeçalho concentra status/identidade e navegação, consumindo altura relevante em celular. Parte das mesmas informações e ações reaparece na Home e em Ajustes.

Objetivo de P1: reduzir chrome fixo e duplicação, preservando contexto do culto e acesso previsível às funções.

## `src/components/home/HomeScreen.tsx`

A Home historicamente acumulou identificação, status do culto, dirigente, métricas, ações principais, encerramento, atalhos para módulos, Ajustes e instalação.

As métricas já foram corrigidas no P0. P1 não deve quebrar isso.

Objetivo: transformar a Home em contexto + próxima ação, não em outro menu completo.

## `src/components/configuracoes/SettingsModal.tsx`

Ainda é uma área ampla que reúne preferências pessoais, identificação, dirigente, obreiros, segurança/PIN e configuração de nuvem/Firebase. O P0 alterou partes de segurança; preserve esses contratos.

P1 deve separar mentalmente e visualmente preferências comuns de administração e sistema avançado. Não mova regra crítica de autorização apenas para UI.

## Identificação

A seleção de nome é identificação operacional, não autenticação individual forte. Não redesenhe P1 como sistema de contas. Ações privilegiadas continuam protegidas pelas regras P0.

# Estado que P2 encontrará

## Formulários de aviso

### `FormVisitante.tsx`

Historicamente, campos opcionais vazios podiam virar valores presumidos como `Auriflama` e `Primeira Visita`. P2 deve preservar ausência como ausência ou exigir escolha explícita.

### `FormReuniao.tsx`

O formulário mostra muitas opções simultâneas e historicamente persiste expressões relativas como “Próxima Terça-feira”. P2 deve melhorar a sequência cognitiva e persistir data absoluta, mantendo renderização amigável e compatibilidade com registros antigos.

### `FormOracao.tsx` e `FormAvisoGeral.tsx`

Existem categorias/públicos predefinidos. Antes de remover ou tornar opcional qualquer escolha, localize onde esses campos são usados em Púlpito, Histórico, filtro, relatório ou regra. Não remova apenas por parecer redundante.

## `MeusAvisosHoje.tsx`

Cancelamento de pendente já existe e foi protegido no P0. P2 pode melhorar recuperação/edição enquanto o item ainda está pendente, mas não deve permitir editar/apagar um registro já anunciado sem nova decisão de produto.

## `HistoricoScreen.tsx`

O P0 corrigiu integridade restringindo a visão atual ao culto corrente, evitando mistura incorreta. Isso foi uma solução provisória de integridade, não o desenho final do Histórico.

P2 deve implementar Histórico real por sessão/culto, com lista de cultos anteriores e detalhe por culto. Métricas, busca, filtros e relatório devem usar o culto selecionado.

A implementação precisa preservar acesso aos avisos antigos já persistidos. Verifique se o storage atual mantém informação suficiente de culto; se faltar catálogo de cultos finalizados, trate a mudança de schema/migração conscientemente.

## `PulpitoScreen.tsx` e `AvisoCardPulpito.tsx`

O Púlpito é uma das partes mais fortes do produto. Preserve tipografia, hierarquia, cores de categoria, Para Ler/Já Lidos, marcação e desfazer.

P2 deve reduzir chrome ao redor do modo de leitura, não redesenhar os cards por estética.

# P1 — ordem recomendada

Implemente P1 como uma fase coerente e valide antes de começar formulários/P2.

1. Inspecione `App.tsx`, `Header.tsx`, `HomeScreen.tsx`, `SettingsModal.tsx`, `LoginScreen.tsx` e os destinos atuais de navegação.
2. Faça um plano curto citando o que será preservado, removido de duplicação e reposicionado.
3. Defina a navegação mobile final pelo render real. Bottom navigation é uma hipótese, não obrigação.
4. Priorize a tela inicial/destino inicial por contexto:
   - recepção/diaconia → Anotação mais imediata;
   - dirigente atual → Púlpito mais imediato;
   - administrador → Home/Histórico/Administração acessíveis sem competir com a operação.
5. Simplifique Home.
6. Reduza Header/chrome.
7. Reorganize Settings em categorias compreensíveis.
8. Revise linguagem operacional.
9. Rode lint/build e valide render antes de considerar P1 concluído.

## Critérios observáveis de P1

- usuário comum não vê controles administrativos competindo com a tarefa principal;
- dirigente chega ao Púlpito com menos navegação que antes;
- recepção chega à Anotação com menos distração;
- nenhuma função necessária fica inacessível a uma pessoa que acumula papéis;
- não há grid/atalhos que apenas duplicam a navegação principal;
- Settings diferencia claramente preferências, administração e sistema avançado;
- Firebase/runtime config, se mantido, não aparece como preferência comum;
- cabeçalho ocupa menos altura e não trunca informação relevante por volta de 360 px;
- Púlpito não perde área útil/legibilidade;
- permissões P0 continuam válidas no comportamento, não apenas na aparência.

# P2 — ordem recomendada

Após P1 validado:

## P2A — captura de informações

1. campos opcionais sem fatos inventados;
2. reunião com hierarquia clara;
3. datas absolutas + apresentação amigável;
4. revisar campos sem efeito real;
5. edição/desfazer de pendente se puder ser feita sem degradar o fluxo.

Faça migração/compatibilidade quando alterar schema. Não apague registros antigos para simplificar implementação.

## P2B — Histórico por culto

Antes de editar UI, determine no storage como enumerar cultos passados de forma confiável. Se hoje só existe `CULTO_ATIVO`, implemente a menor extensão de domínio necessária para manter sessões encerradas consultáveis, sem substituir a arquitetura de persistência.

Resultado esperado:

- lista de cultos/sessões por data, nome, dirigente e quantidade;
- detalhe de uma sessão;
- métricas, busca, filtros e relatório daquele culto;
- sem mistura silenciosa entre sessões.

## P2C — Púlpito focado

Reduza chrome preservando:

- culto/status;
- quantidade pendente;
- tamanho da fonte;
- Para Ler/Já Lidos;
- cards;
- saída clara do modo focado;
- desfazer marcação quando aplicável.

## P2D — polish

Somente no final:

- reduzir cards/badges/sombras sem função;
- corrigir textos críticos pequenos;
- garantir touch targets próximos de 44 px;
- adicionar `prefers-reduced-motion` onde relevante;
- testar tema claro/escuro, fonte aumentada, teclado e viewport estreito.

# Restrições

- não reescrever arquitetura inteira;
- não trocar React/Vite/Capacitor/Firebase;
- não adicionar biblioteca de UI ou state manager só por conveniência;
- não criar backend de identidade;
- não reintroduzir dados demo ou credenciais padrão;
- não quebrar compatibilidade de storage sem migração;
- não usar P1/P2 para refatoração cosmética ampla;
- não tornar o Púlpito mais denso às custas de leitura;
- não esconder funcionalidades necessárias apenas para produzir uma UI mais “limpa”.

# Validação por fase

Sempre executar:

```bash
npm run lint
npm run build
```

Para P1 e qualquer P2 visual, validar render real em aproximadamente 360 px e em viewport maior.

Além disso, após cada fase, revalidar uma amostra dos invariantes P0: identificação, administrador, troca de dirigente, início/encerramento de culto, registro de aviso, recebimento no Púlpito, anúncio/desfazer e cancelamento de pendente.

# Critério de pronto do handoff

O Gemini pode considerar este handoff consumido quando:

- P0 é tratado como baseline estável;
- P1 foi implementado e validado antes de P2;
- cada subfase P2 foi implementada sem apagar compatibilidade anterior;
- checklists do plano principal Gemini e do plano Sonnet foram atualizados após cada fase;
- commits permanecem separados por fase suficiente para revisão objetiva.
