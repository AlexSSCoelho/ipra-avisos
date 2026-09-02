# IPRA Avisos — plano de implementação UX para Claude Sonnet 4.6 no Antigravity

# Objetivo

Evoluir o aplicativo `AlexSSCoelho/ipra-avisos` a partir da auditoria do código e de 15 capturas reais do Android, melhorando experiência de usuários leigos, arquitetura de informação, permissões, confiabilidade, navegação mobile, legibilidade e eficiência operacional.

O executor original desta especificação foi **Claude Sonnet 4.6 (Thinking) no Google Antigravity**. A continuidade de P1/P2 foi transferida para **Gemini 3.7 Flash**, usando `IPRA_AVISOS_UX_IMPLEMENTATION_GEMINI_3_7_FLASH.md` e `IPRA_AVISOS_P1_P2_HANDOFF_GEMINI_3_7_FLASH.md`.

# Estado sincronizado de implementação

Este checklist reflete a branch `implementacao-fases` após o commit `e361d90a5455464a3d06070007836ad476529769` e deve permanecer sincronizado com o plano do Gemini.

## P0 — integridade e autorização — CONCLUÍDO

- [x] remover dados demo/fallbacks fictícios de produção;
- [x] remover autoidentificação como primeiro obreiro;
- [x] limitar swipe global e respeitar controles/`no-swipe`;
- [x] persistir horário escolhido para novo culto;
- [x] métricas da Home usam o culto atual;
- [x] relatório P0 não mistura cultos;
- [x] `setDirigenteDoCulto()` não cria culto;
- [x] remover PIN padrão/fallback `1234`;
- [x] bootstrap explícito para primeira instalação;
- [x] `isAdmin` depende de permissão explícita;
- [x] migração legada preserva `isAdmin: false` e atua apenas quando a propriedade estava ausente;
- [x] `currentUser` sincroniza com registro migrado;
- [x] cadastro normal de obreiros é administrativo e sem bypass público;
- [x] instalação existente com admin e sem PIN possui migração explícita;
- [x] dirigente atual se identifica sem redigitar PIN quando não há troca;
- [x] troca real de dirigente continua protegida;
- [x] encerrar culto inválido retorna falha;
- [x] regras de cancelamento/exclusão de aviso pendente por autor/status/permissão;
- [x] aviso anunciado não é apagado pelo fluxo comum;
- [x] PIN administrativo numérico com mínimo de 4 dígitos;
- [x] terminologia administrativa padronizada.

P0 é baseline estável. Não deve ser reaberto salvo regressão concreta reproduzida durante P1/P2.

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
- [ ] persistir datas absolutas;
- [ ] revisar opções que não afetam Púlpito/Histórico/relatórios;
- [ ] melhorar edição/desfazer de aviso pendente;
- [ ] implementar Histórico real por culto/sessão;
- [ ] criar modo focado de Púlpito;
- [ ] refinar densidade visual, tipografia, motion e acessibilidade sem trocar identidade.

# Contexto de continuidade

A execução futura deve seguir o plano do Gemini e o handoff P1/P2. As decisões centrais já tomadas permanecem:

- fluxo operacional: **registrar → chegar ao Púlpito → anunciar → registrar como concluído**;
- identidade azul-marinho/branco/âmbar e cores de categoria preservadas;
- Púlpito é referência de legibilidade e não deve ser redesenhado indiscriminadamente;
- offline-first deve permanecer;
- seleção de nome é identificação operacional, não autenticação individual forte;
- administração e PIN seguem contratos P0 explícitos;
- uma pessoa pode acumular funções, portanto P1 deve priorizar tarefas sem hard-hiding desnecessário;
- P0 restringiu temporariamente o Histórico ao culto atual para preservar integridade; Histórico real por sessões pertence a P2.

# Direção de P1

P1 deve atuar sobre navegação, Home, Header e Settings. O problema é duplicação e excesso de chrome, não falta de estética.

- recepção/diaconia prioriza Anotação;
- dirigente prioriza Púlpito;
- administração mantém Home/Histórico/Administração acessíveis;
- Home vira contexto + próxima ação;
- Header perde altura/duplicação;
- Settings separa Preferências, Identificação, Administração do culto, Pessoas, Segurança e Sistema avançado;
- Firebase/runtime config não compete com preferências comuns;
- validar largura próxima de 360 px.

# Direção de P2

- opcionais vazios permanecem ausentes, não viram fatos presumidos;
- formulário de reunião segue Qual reunião? → Quando? → Onde? → Responsável;
- datas são persistidas de forma absoluta com apresentação amigável;
- campos só são removidos após confirmar que não têm efeito real;
- edição/desfazer pode existir apenas enquanto pendente, salvo nova decisão de produto;
- Histórico deve listar cultos e detalhar métricas/filtros/relatório por sessão;
- Púlpito focado reduz chrome ao redor dos cards sem reduzir legibilidade;
- polish vem por último.

# Restrições

- não reabrir P0 sem regressão reproduzida;
- não trocar stack, Firebase ou arquitetura inteira;
- não adicionar biblioteca de UI/state manager por conveniência;
- não quebrar storage sem migração;
- não criar sistema de contas/back-end de identidade;
- não usar P1/P2 para refatoração ampla não relacionada;
- não reduzir legibilidade do Púlpito.

# Validação

Sempre executar:

```bash
npm run lint
npm run build
```

Validar render real em aproximadamente 360 px e viewport maior. Após cada fase, revalidar uma amostra dos invariantes P0.

Ao finalizar cada fase, sincronizar este checklist com o plano do Gemini e informar arquivos alterados, comportamento antes/depois, validações e SHA do commit.

---

# Sincronização de Conclusão da Fase P2

Executada integralmente por **Gemini 3.7 Flash**:

- **P2A (Commit `b4183b7`):** Formulários sem dados fabricados, Reunião estruturada cognitivamente com `dataIso`, modal de edição de avisos pendentes, e incorporação da relação oficial de obreiros reais da IPRA Auriflama (Alex Coelho master admin, Pr. Cláudio Lísias e Diác. Júlio Coelho admins, menção honrosa aos pastores eméritos José Roberto Moraes e Israel Firmino) conforme recomendação direta do usuário.
- **P2B (Commit `56db9d2`):** Catálogo de cultos passados com reconciliação automática, seletor de sessões no Histórico e isolamento rigoroso de métricas, filtros, busca e relatórios para o culto selecionado.
- **P2C (Commit `dcc6ab0`):** Modo focado imersivo do Púlpito com retração de Header e BottomNav, controles de fonte, saída evidente via tecla Escape ou botão flutuante e bloqueio de swipe acidental.
- **P2D (Commit `8f46223`):** Suporte estrito a `prefers-reduced-motion`, touch targets mínimos de 44x44px e prevenção de zoom no Safari iOS.
- **P2E:** Checklists de documentação Sonnet e Gemini sincronizados. Build e Lint 100% aprovados.
