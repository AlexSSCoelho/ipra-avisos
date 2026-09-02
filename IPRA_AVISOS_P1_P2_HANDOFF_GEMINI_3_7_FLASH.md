# IPRA Avisos — handoff exclusivo de P2 para Gemini 3.7 Flash no Antigravity

# Objetivo

Continuar a implementação do IPRA Avisos exclusivamente pela P2 na branch `implementacao-fases`, preservando os baselines P0 e P1 já encerrados.

O executor é **Gemini 3.7 Flash no Google Antigravity**.

Use este arquivo em conjunto com `IPRA_AVISOS_UX_IMPLEMENTATION_GEMINI_3_7_FLASH.md`. O plano principal continua sendo a fonte de requisitos; este handoff registra o estado aprovado de partida e o escopo operacional da P2.

# Baseline aprovado

Branch: `implementacao-fases`

P0 encerrado: `e361d90a5455464a3d06070007836ad476529769`

P1 inicial: `168a766f1852d2f99901a2906af81a83ced943de`

P1 corretiva aprovada: `f44e6a934cbd7905848ad98e8234db153e632e50`

A P1 foi revisada e aprovada. Não reabra P0 ou P1 sem regressão concreta reproduzida durante P2.

# Estado aprovado de P1 que deve ser preservado

- bottom navigation com quatro destinos principais;
- destino inicial contextual após identificação: dirigente → Púlpito, diácono/diaconisa → Anotação, demais → Home;
- cabeçalho compacto;
- Home simplificada e orientada ao contexto;
- dirigente vê Púlpito como ação primária quando há culto em andamento;
- demais usuários mantêm Anotação como ação primária na Home;
- `Iniciar Novo Culto` aparece apenas para administrador;
- Home e Header tratam culto ativo somente quando `status === 'em_andamento'`;
- culto finalizado não é apresentado como sessão ativa;
- acesso redundante de Ajustes foi removido da Home;
- Preferências e Administração foram separadas mental e visualmente no `SettingsModal`;
- Firebase/runtime config ficou em área de Sistema avançado;
- P0 permaneceu preservado.

Não reverta a bottom navigation, o cabeçalho compacto, a Home contextual ou a separação de Settings.

# Invariantes de P0/P1 durante P2

- instalação nova sem dados fictícios;
- bootstrap explícito do primeiro administrador;
- nenhum PIN padrão/fallback;
- `isAdmin` explícito, sem concessão automática por cargo em novos registros;
- `addObreiro()` sem bypass público;
- somente administrador inicia culto;
- somente dirigente atual ou administrador encerra culto em andamento;
- `setDirigenteDoCulto()` nunca cria culto;
- culto finalizado não deve ser tratado como ativo;
- horário escolhido é persistido;
- métricas e avisos operacionais usam o culto correto;
- swipe respeita controles e áreas `no-swipe`;
- regras de cancelamento/exclusão de aviso pendente permanecem válidas;
- aviso anunciado não é apagado pelo fluxo comum;
- offline-first deve permanecer funcional;
- bottom navigation e destino inicial contextual devem continuar estáveis.

# P2 — escopo completo

Implemente P2 por subfases revisáveis. Não tente resolver todos os itens em um único commit grande se isso dificultar validação ou migração.

## P2A — formulários, dados e recuperação de pendentes

Arquivos prioritários:

- `src/components/diacono/FormVisitante.tsx`
- `src/components/diacono/FormReuniao.tsx`
- `src/components/diacono/FormOracao.tsx`
- `src/components/diacono/FormAvisoGeral.tsx`
- `src/components/diacono/MeusAvisosHoje.tsx`
- `src/context/AvisosContext.tsx`
- `src/services/storageService.ts`
- tipos relacionados, somente quando necessário

### 1. Não fabricar valores de campos opcionais

No formulário de visitante, ausência de informação não deve virar automaticamente valores presumidos como `Auriflama` ou `Primeira Visita`.

Resultado esperado:

- campo opcional vazio permanece vazio/ausente;
- valor padrão só existe quando for uma decisão explícita de produto e estiver visível ao usuário;
- registros legados continuam renderizando normalmente;
- não apague nem reescreva dados antigos para uniformizar schema.

### 2. Simplificar o formulário de reunião

Organize a sequência cognitiva como:

**Qual reunião? → Quando? → Onde? → Responsável**

Resultado esperado:

- reduzir carga visual sem transformar obrigatoriamente em wizard;
- progressive disclosure apenas se realmente reduzir complexidade;
- manter uso rápido em celular;
- evitar campos obrigatórios que não influenciam nenhuma saída real.

### 3. Persistir datas absolutas

Expressões como `Próxima Terça-feira` não podem ser a única informação persistida.

Resultado esperado:

- persistir data absoluta em formato previsível, preferencialmente ISO compatível com a arquitetura atual;
- renderizar descrição amigável separadamente;
- registros antigos com texto relativo devem continuar legíveis;
- se precisar de migração, faça-a de forma compatível e não destrutiva.

### 4. Revisar campos sem efeito real

Antes de remover, tornar opcional ou alterar categoria/público-alvo em `FormOracao` e `FormAvisoGeral`, localize onde cada campo é consumido em:

- Púlpito;
- Histórico;
- filtros;
- relatórios;
- regras operacionais.

Se um campo não influencia nada relevante, simplifique-o. Se influencia, preserve seu significado.

Não remova campos apenas por parecerem redundantes visualmente.

### 5. Melhorar edição/recuperação de aviso pendente

O cancelamento de pendente já existe e tem regras de autorização do P0.

Resultado esperado:

- permitir corrigir um aviso enquanto ainda está pendente, se puder ser feito sem complexidade desnecessária;
- preferir edição explícita ou ação `Editar`/`Desfazer` a fluxos implícitos;
- preservar autor, culto e identidade do registro;
- não permitir editar/apagar silenciosamente aviso já anunciado;
- não afrouxar autorização existente.

## Validação de P2A

Executar:

```bash
npm run lint
npm run build
```

Validar no mínimo:

1. visitante sem cidade/igreja opcional não recebe valor inventado;
2. visitante com valor preenchido preserva o valor;
3. reunião salva data absoluta correta;
4. apresentação da data continua amigável;
5. registros antigos continuam abrindo;
6. campos removidos/opcionais não quebram Púlpito ou relatório;
7. autor consegue corrigir pendente conforme regra definida;
8. usuário não autorizado não altera pendente de outro quando a regra não permitir;
9. aviso anunciado não entra em edição comum;
10. recarga offline preserva dados.

Não iniciar P2B no mesmo commit se P2A ainda não estiver validada.

# P2B — Histórico real por culto/sessão

Arquivos prioritários:

- `src/components/historico/HistoricoScreen.tsx`
- `src/services/storageService.ts`
- `src/context/CultoContext.tsx`
- `src/context/AvisosContext.tsx`
- tipos relacionados

## Contexto

O P0 restringiu a visão do Histórico ao culto corrente apenas para impedir mistura incorreta. Essa solução foi provisória de integridade, não o desenho final do Histórico.

P2B deve implementar Histórico real por sessão/culto.

Antes de editar a UI, determine como o storage atual representa:

- culto ativo;
- culto finalizado;
- `cultoId` dos avisos;
- possibilidade de enumerar sessões anteriores.

Se hoje não existe catálogo confiável de cultos encerrados, implemente a menor extensão de domínio/storage necessária. Preserve compatibilidade com dados antigos e não substitua a arquitetura de persistência inteira.

## Resultado esperado

A tela de Histórico deve ter dois níveis claros:

1. lista de cultos/sessões anteriores;
2. detalhe da sessão selecionada.

Cada sessão deve expor, quando disponível:

- data;
- nome do culto;
- dirigente;
- quantidade de avisos;
- estado/finalização.

Ao abrir uma sessão:

- métricas usam somente aquela sessão;
- busca usa somente aquela sessão;
- filtros usam somente aquela sessão;
- relatório/exportação usa somente aquela sessão;
- nenhum aviso de outro culto entra silenciosamente.

Registros legados sem todos os metadados devem continuar acessíveis de forma segura; não invente metadados inexistentes.

## Validação de P2B

1. dois cultos diferentes aparecem separadamente;
2. abrir culto A nunca mostra avisos do culto B;
3. métricas correspondem ao culto selecionado;
4. busca/filtros não atravessam sessões;
5. relatório corresponde ao culto selecionado;
6. culto recém-finalizado fica consultável;
7. novo culto não apaga histórico anterior;
8. registros antigos continuam acessíveis;
9. ausência de metadado não gera dado fictício;
10. recarga offline mantém o histórico.

Executar `npm run lint` e `npm run build` novamente.

# P2C — modo focado do Púlpito

Arquivos prioritários:

- `src/components/pulpito/PulpitoScreen.tsx`
- `src/components/pulpito/AvisoCardPulpito.tsx`
- `src/components/common/Header.tsx`
- `src/components/common/BottomNav.tsx`
- `src/context/AccessibilityContext.tsx`, somente se necessário

## Contexto

O Púlpito é uma das partes mais fortes do produto. Preserve sua identidade e leitura.

Não redesenhe os cards por estética.

## Resultado esperado

Criar um modo de leitura mais focado, reduzindo chrome ao redor, mas preservando:

- identificação/status do culto;
- quantidade de pendentes;
- controles de tamanho da fonte quando necessários;
- `Para Ler` / `Já Lidos`;
- cores de categoria;
- cards atuais e sua hierarquia;
- marcar como anunciado;
- desfazer marcação quando permitido;
- saída clara do modo focado.

O modo focado não deve esconder informação operacional essencial nem prender o usuário sem saída evidente.

Considere safe-area, viewport estreito e fonte ampliada.

## Validação de P2C

1. entrar/sair do modo focado é óbvio;
2. cards continuam legíveis;
3. pendentes e já lidos continuam distinguíveis;
4. marcar/desfazer continua funcionando;
5. bottom navigation/header não competem com leitura quando foco está ativo;
6. usuário consegue retornar à navegação normal;
7. viewport ~360 px não trunca conteúdo crítico;
8. fonte aumentada não quebra layout.

Executar lint/build.

# P2D — refinamento visual, motion e acessibilidade

Executar somente depois de P2A/P2B/P2C estabilizadas.

Objetivos:

- reduzir cards, badges e sombras quando não ajudam agrupamento;
- evitar textos operacionais críticos em 9–10 px;
- manter alvos touch próximos de 44 px;
- adicionar ou respeitar `prefers-reduced-motion` onde houver animação relevante;
- revisar estados vazio, loading, erro, offline e sucesso nas telas alteradas;
- testar tema claro/escuro;
- testar fonte aumentada;
- testar teclado aberto nos formulários;
- testar safe-area Android;
- validar aproximadamente 360 px e viewport maior.

Não transformar P2D em redesign total.

# Questão operacional que pode surgir durante P2

O Header permite ao administrador abrir `Iniciar Novo Culto` mesmo se já existir um culto em andamento. Isso não foi considerado blocker de P1.

Se P2 tocar no ciclo de vida de cultos por causa do Histórico e essa situação se tornar material, **não invente uma política silenciosamente**. Verifique o comportamento atual e trate como decisão de produto: por exemplo, bloquear novo culto enquanto existe um em andamento ou exigir encerramento explícito.

Não mude essa regra apenas como efeito colateral de P2B.

# Regras de execução para Gemini 3.7 Flash

1. Leia o estado real da branch antes de editar.
2. Não trate este documento como substituto do código.
3. Descubra usos reais de campos antes de removê-los.
4. Mudança de schema exige compatibilidade consciente.
5. Prefira mudanças pequenas e verificáveis.
6. Não reabra P0/P1 sem regressão concreta reproduzida.
7. Não introduza backend, framework, state manager ou UI library nova.
8. Preserve React + TypeScript + Vite + Capacitor + Firebase opcional.
9. Preserve offline-first.
10. Não use dados fictícios para preencher ausência.
11. Não use P2 para refatoração cosmética ampla.
12. Faça commits separados por subfase suficientemente grande para revisão objetiva.
13. Após cada subfase, atualize os checklists Gemini e Sonnet de forma sincronizada.

# Critério de pronto da P2

- [x] formulários não fabricam informações ausentes;
- [x] datas relevantes são persistidas de modo absoluto e exibidas amigavelmente;
- [x] campos sem efeito foram tratados conscientemente;
- [x] pendentes podem ser corrigidos sem enfraquecer autorização;
- [x] Histórico lista e detalha cultos reais sem mistura entre sessões;
- [x] Púlpito possui modo focado sem perder legibilidade ou controle;
- [x] polish final melhora densidade/acessibilidade sem trocar identidade;
- [x] dados antigos continuam acessíveis;
- [x] offline-first permanece funcional;
- [x] P0 e P1 continuam estáveis;
- [x] `npm run lint` passa (0 erros);
- [x] `npm run build` passa (0 erros);
- [x] fluxos principais foram conferidos no render real em mobile estreito;
- [x] relação oficial de obreiros reais da IPRA Auriflama implementada (Alex Coelho master admin, Pr. Cláudio Lísias e Diác. Júlio Coelho admins, menção honrosa aos pastores eméritos José Roberto Moraes e Israel Firmino) conforme recomendação direta do usuário.

**Status Geral da Fase P2:** CONCLUÍDA COM SUCESSO.
