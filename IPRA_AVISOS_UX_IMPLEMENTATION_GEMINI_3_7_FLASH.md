# IPRA Avisos — plano de implementação UX para Gemini 3.7 Flash

# Objetivo

Evoluir o aplicativo `AlexSSCoelho/ipra-avisos` a partir da auditoria do código e de 15 capturas reais do Android, melhorando experiência de usuários leigos, arquitetura de informação, permissões, confiabilidade, navegação mobile, legibilidade e eficiência operacional.

O executor desta especificação é **Gemini 3.7 Flash no Google Antigravity**.

A intenção não é redesenhar o produto por estética. Preserve a identidade visual atual e especialmente a clareza do Púlpito. Priorize primeiro integridade, autorização e fluxo; refinamentos visuais vêm depois.

# Estado sincronizado de implementação

Este checklist reflete o estado da branch `implementacao-fases` após o commit `45a249e9e29d0d0fcccc9c664c4e530d0ac287e7` e deve permanecer sincronizado com `IPRA_AVISOS_UX_IMPLEMENTATION_CLAUDE_SONNET_4_6.md`.

## P0 — integridade e autorização

- [x] remover dados demo/fallbacks fictícios de produção;
- [x] remover autoidentificação como primeiro obreiro;
- [x] limitar swipe global e respeitar controles/`no-swipe`;
- [x] persistir o horário real escolhido para novo culto;
- [x] métricas da Home passam a usar o culto atual;
- [x] relatório atual não mistura avisos globais com a data do culto;
- [x] `setDirigenteDoCulto()` não cria mais um culto por rota indireta;
- [x] PIN padrão/fallback `1234` removido;
- [x] bootstrap explícito para primeira instalação criado;
- [x] `isAdmin` passou a depender de permissão explícita;
- [x] cadastro comum de obreiros saiu da tela de identificação;
- [x] exclusão/cancelamento de aviso pendente ganhou regra por autor/status/permissão;
- [x] aviso anunciado não é apagado pelo fluxo comum;
- [ ] dirigente atual deve conseguir se identificar sem PIN quando não há troca real;
- [ ] remover `bypassAdminCheck` público de `addObreiro()` e substituir por operação específica de bootstrap;
- [ ] tratar migração de instalação existente com admin, mas sem PIN persistido;
- [ ] restringir `setInitialPin()` ou equivalente a bootstrap/migração válidos;
- [ ] `finalizarCulto()` deve falhar quando não existe culto em andamento ou ele já está finalizado;
- [ ] sincronizar `currentUser` com registro migrado de `isAdmin`.

As pendências acima estão detalhadas em `IPRA_AVISOS_P0_CORRECOES_FINAIS_GEMINI_3_7_FLASH.md`. **Não iniciar P1 antes de todas estarem concluídas e validadas.**

## P1 — arquitetura de informação e experiência mobile

- [ ] tornar navegação orientada à tarefa;
- [ ] simplificar Home e remover duplicações;
- [ ] reduzir cabeçalho fixo;
- [ ] separar Preferências de Administração;
- [ ] clarificar identificação versus autenticação;
- [ ] refinar linguagem operacional e remover termos técnicos/ambíguos.

## P2 — formulários, histórico e refinamento

- [ ] não fabricar valores de campos opcionais;
- [ ] simplificar formulário de reunião;
- [ ] persistir datas absolutas em vez de expressões relativas;
- [ ] revisar opções que não afetam Púlpito/Histórico/relatórios;
- [ ] melhorar edição/desfazer de aviso pendente;
- [ ] implementar Histórico real por culto/sessão;
- [ ] criar modo focado de Púlpito;
- [ ] refinar densidade visual, tipografia, motion e acessibilidade sem trocar identidade.

# Contexto relevante

O IPRA Avisos é um aplicativo React + TypeScript + Vite, empacotável via Capacitor para Android. O fluxo principal conecta recepção/diaconia ao dirigente do culto.

Tipos de registro:

- visitante;
- pedido de oração;
- reunião/grupo;
- comunicado geral.

Persistência e sincronização:

- `localStorage`;
- `BroadcastChannel`;
- Firestore opcional;
- funcionamento offline-first deve ser preservado.

Usuários/tarefas principais:

1. **Recepção / Diaconia** — registrar aviso rapidamente e confirmar que chegou ao Púlpito.
2. **Dirigente / Púlpito** — ler pendências, marcar como anunciado e recuperar enganos.
3. **Administração** — iniciar/encerrar culto, definir dirigente, gerenciar obreiros, consultar histórico e configurar o sistema.

O fluxo central deve permanecer simples: **registrar → chegar ao Púlpito → anunciar → registrar como concluído**.

# O que já funciona e deve ser preservado

- identidade visual azul-marinho/branco/âmbar;
- cores de categoria;
- boa hierarquia e legibilidade do Púlpito;
- separação conceitual entre Anotação, Púlpito e Histórico;
- fluxo operacional de envio e anúncio;
- suporte offline-first;
- touch targets e tipografia já razoáveis em boa parte da interface.

# Problema central

O aplicativo está visualmente mais maduro do que sua arquitetura de informação. Funções repetidas aparecem no cabeçalho, Home, cards, perfil e Ajustes. Isso aumenta carga cognitiva para usuários leigos e consome espaço vertical no celular.

As primeiras fases também revelaram problemas de autorização, bootstrap e escopo de dados; por isso P0 precisa estar realmente fechado antes de qualquer reorganização visual.

# Prioridade P0

## 1. Dados e primeiro uso

Produção deve iniciar vazia ou em onboarding explícito. Dados demo só podem existir em modo de desenvolvimento/demonstração opt-in. Erro de parse nunca vira dado fictício.

Estado: **concluído**, com bootstrap inicial criado; restam apenas as correções finais descritas no arquivo específico do Gemini.

## 2. Identificação e administração

Sem usuário persistido válido, `currentUser` deve ser `null`. Identificação por nome não deve ser comunicada como autenticação forte. Administração depende de permissão explícita, não de cargo.

Estado: **parcialmente concluído**; falta sincronizar `currentUser` durante migração e fechar contratos de bootstrap/PIN.

## 3. Ações críticas

Iniciar/encerrar culto, trocar dirigente, gerenciar obreiros, alterar segurança e marcar/desmarcar avisos precisam de autorização coerente em UI e domínio/context.

Estado: **quase concluído**; faltam os últimos gaps listados no checklist.

## 4. Swipe

A navegação horizontal não pode competir com formulários, chips, botões ou regiões roláveis. O handler deve respeitar `data-no-swipe`, `.no-swipe`, inputs, selects, botões e links.

Estado: **concluído**.

## 5. Horário do culto

Se o horário é editável, o valor escolhido deve ser persistido; caso contrário, o controle deveria ser removido.

Estado: **concluído** com `input type="time"` e persistência do valor.

## 6. Escopo de Histórico/relatório

Relatórios e métricas não podem misturar cultos. A correção P0 passou a usar o culto atual, o que evita relatório incorreto.

Estado: **P0 concluído para integridade**, mas Histórico por sessões anteriores continua em P2.

## 7. Métricas da Home

Métricas do culto em andamento devem considerar apenas `avisosCultoAtual`.

Estado: **concluído**.

# Prioridade P1 — reorganizar experiência e arquitetura de informação

Só iniciar após fechamento do P0.

## 8. Navegação orientada à tarefa

Recepção/diaconia deve chegar à Anotação com mínima fricção; dirigente ao Púlpito; administração a Home/Histórico/Administração. Uma pessoa pode acumular funções, portanto evite hard-hiding desnecessário.

No mobile, avalie navegação inferior versus cabeçalho atual pelo resultado real, não por tendência. Máximo de quatro destinos primários, ícone+rótulo e estado ativo inequívoco.

## 9. Simplificar Home

A Home deve responder rapidamente:

1. qual culto está ativo;
2. qual é meu contexto;
3. qual ação provavelmente preciso executar.

Remover grid que repete navegação, limitar ações secundárias, mover instalação/download para área secundária e mostrar encerrar culto apenas a autorizado.

## 10. Reduzir cabeçalho fixo

Preservar status essencial do culto e pendências, reduzir controles administrativos permanentes, evitar repetição imediata de identidade/status e corrigir truncamentos em aproximadamente 360 px.

## 11. Separar Preferências de Administração

Organização esperada:

- Preferências: som, tema, fonte, app;
- Identificação: usuário atual/troca;
- Administração do culto: dirigente/iniciar/encerrar;
- Pessoas: obreiros/permissões;
- Segurança: PIN;
- Sistema avançado: sincronização/diagnóstico.

Firebase JSON não deve competir com preferências comuns; se runtime config permanecer necessário, colocá-lo em área avançada protegida.

## 12. Identificação versus autenticação

Seleção simples de nome é identificação operacional. Ações privilegiadas devem ter autorização independente e comunicação coerente.

## 13. Linguagem operacional

- “MASTER” → “Administrador” quando necessário;
- “Copiar para WhatsApp” → “Copiar relatório” se apenas copia;
- “Guarda permanente” somente se a garantia existir;
- “No Púlpito” em pendentes → “Aguardando anúncio”/“Enviado ao púlpito”.

# Prioridade P2

## 14. Campos opcionais

Não transformar ausência de cidade/igreja em `Auriflama`/`Primeira Visita` sem escolha explícita.

## 15. Reunião

Hierarquia: **Qual reunião? → Quando? → Onde? → Responsável**. Pode continuar numa tela; use progressive disclosure apenas se reduzir carga cognitiva.

## 16. Datas

Persistir datas absolutas e renderizar texto amigável. Expressões como “Próxima Terça-feira” não podem ser a única informação armazenada.

## 17. Campos sem efeito

Confirmar uso real antes de obrigar escolha. Se categoria/público-alvo não influencia Púlpito, Histórico, filtro, relatório ou regra, revisar necessidade.

## 18. Correção de aviso pendente

Avaliar edição enquanto pendente ou ação “Desfazer/Editar” após envio, sem complexidade excessiva.

## 19. Histórico por culto

Entrada deve listar sessões por data/nome/dirigente/quantidade. Ao abrir, métricas, filtros, busca e exportação respeitam a sessão selecionada.

## 20. Púlpito focado

Preservar o visual forte atual e reduzir chrome: culto/status, pendentes, fonte, Para Ler/Já Lidos e cards. Deve existir saída clara do modo focado.

## 21. Refinamento visual

Reduzir cards/badges/sombras apenas quando não ajudam agrupamento. Evitar texto operacional em 9–10 px. Manter alvos touch próximos de 44 px e considerar `prefers-reduced-motion`.

# Regras de implementação

1. Leia o estado atual da branch antes de editar.
2. Não trate este documento como substituto do código real.
3. Corrija domínio/context/storage antes de alinhar UI quando a regra for de autorização.
4. Implemente por fases; não reescreva o app inteiro.
5. Preserve offline-first e dados reais existentes.
6. Não introduza backend, framework, UI library ou state manager sem necessidade direta.
7. Não use credenciais padrão, dados demo ou flags de bypass para simplificar regras.
8. Não transforme o app em dashboard genérico.
9. Não reduza legibilidade do Púlpito.
10. Não adicione motion decorativo.
11. Fatos descobríveis no repositório devem ser investigados, não perguntados.
12. Decisões que mudem permissões, significado dos dados ou fluxo do culto devem ser tratadas como decisões de produto bloqueantes.

# Execução sugerida

## Fase 1 — fechar P0

Executar apenas `IPRA_AVISOS_P0_CORRECOES_FINAIS_GEMINI_3_7_FLASH.md`, validar e atualizar este checklist.

## Fase 2 — arquitetura mobile

Navegação, Home, cabeçalho e separação Preferências/Administração.

## Fase 3 — captura de informações

Formulários, datas/horários, defaults e recuperação/edição de pendentes.

## Fase 4 — Histórico e Púlpito

Histórico por culto e modo focado de leitura.

## Fase 5 — polish

Densidade, tipografia, motion, mensagens e acessibilidade.

# Validação

Executar no mínimo:

```bash
npm run lint
npm run build
```

Inspecionar também a interface renderizada em viewport próximo de 360 px e em viewport maior. Build/lint não substituem validação visual.

Cenários globais:

1. instalação nova;
2. bootstrap/admin/PIN;
3. usuário comum sem permissões administrativas;
4. admin iniciando culto;
5. horário persistido;
6. quatro tipos de aviso;
7. chegada ao Púlpito;
8. marcar/desmarcar anúncio;
9. cancelar pendente conforme permissão;
10. encerrar culto autorizado e bloquear indevido;
11. abrir novo culto sem misturar pendências;
12. relatório por culto;
13. recarga offline;
14. chips/seletores sem swipe acidental;
15. tema claro/escuro e fontes;
16. estados vazio/sucesso/erro/sem culto;
17. Histórico de múltiplos cultos quando P2 for implementado;
18. ausência de truncamentos relevantes em mobile estreito.

# Critério de pronto

O plano completo só termina quando P0, P1 e P2 estiverem concluídos, `npm run lint` e `npm run build` passarem, os fluxos críticos forem validados no render real e a identidade visual do IPRA Avisos estiver preservada.

Ao finalizar cada fase, atualize o checklist deste arquivo e o arquivo equivalente do Sonnet para que ambos permaneçam sincronizados.