# IPRA Avisos — plano de implementação UX para Gemini 3.7 Flash

# Objetivo

Evoluir o aplicativo `AlexSSCoelho/ipra-avisos` a partir de uma auditoria conjunta do código real e de 15 capturas reais do aplicativo em Android, melhorando principalmente experiência de usuários leigos, arquitetura de informação, separação de responsabilidades, permissões, confiabilidade dos dados, navegação mobile, legibilidade e eficiência operacional.

A intenção não é redesenhar o produto por estética. A identidade visual atual é coerente e vários fluxos já funcionam bem, sobretudo a leitura no Púlpito. Preserve o que é claro e reconhecível. Priorize primeiro problemas de produto, fluxo e confiabilidade; refinamentos visuais vêm depois.

# Contexto relevante

## Produto

O IPRA Avisos é um aplicativo React + TypeScript + Vite, empacotável com Capacitor para Android, usado durante cultos da IPRA Auriflama. O fluxo principal conecta pessoas da recepção/diaconia que registram informações ao dirigente que lê os avisos no púlpito.

Os quatro tipos de registro são:

- visitante;
- pedido de oração;
- reunião/grupo;
- comunicado geral.

O aplicativo funciona localmente via `localStorage`/`BroadcastChannel` e pode sincronizar com Firestore quando configurado.

## Usuários e tarefas

Considere pelo menos três modos de uso, mesmo que uma pessoa possa acumular funções:

1. **Recepção / Diaconia** — registrar rapidamente um aviso e confirmar que ele chegou ao púlpito.
2. **Dirigente / Púlpito** — ler o que está pendente, marcar como anunciado e recuperar um item marcado por engano.
3. **Administração** — iniciar/encerrar culto, definir dirigente, gerenciar obreiros, consultar histórico, ajustar preferências e configurações administrativas.

A interface deve continuar simples para usuários que não têm familiaridade técnica.

## Stack e comandos existentes

Não troque a stack nem introduza uma biblioteca de UI sem necessidade real.

Comandos existentes em `package.json`:

```bash
npm run build
npm run lint
npm run dev
npm run preview
```

O build já executa TypeScript via `tsc -b` antes do Vite.

## Arquivos principais

Antes de editar, confira o estado atual destes arquivos e os contratos entre eles:

- `src/App.tsx`
- `src/components/common/Header.tsx`
- `src/components/auth/LoginScreen.tsx`
- `src/components/home/HomeScreen.tsx`
- `src/components/diacono/DiaconoDashboard.tsx`
- `src/components/diacono/FormVisitante.tsx`
- `src/components/diacono/FormOracao.tsx`
- `src/components/diacono/FormReuniao.tsx`
- `src/components/diacono/FormAvisoGeral.tsx`
- `src/components/diacono/MeusAvisosHoje.tsx`
- `src/components/pulpito/PulpitoScreen.tsx`
- `src/components/pulpito/AvisoCardPulpito.tsx`
- `src/components/historico/HistoricoScreen.tsx`
- `src/components/configuracoes/SettingsModal.tsx`
- `src/components/culto/IniciarCultoModal.tsx`
- `src/context/AuthContext.tsx`
- `src/context/CultoContext.tsx`
- `src/context/AvisosContext.tsx`
- `src/context/AccessibilityContext.tsx`
- `src/services/storageService.ts`
- `src/types/index.ts`
- `src/index.css`

# Diagnóstico consolidado

## O que já funciona e deve ser preservado

- A divisão conceitual entre **Anotação**, **Púlpito** e **Histórico** é fácil de entender.
- Os quatro tipos de registro usam linguagem compatível com o domínio da igreja.
- O Púlpito possui boa hierarquia visual, tipografia grande, categorias reconhecíveis e uma ação primária evidente para marcar como anunciado.
- A indicação de pendências e a separação entre “para ler” e “já lidos” dão segurança operacional.
- O fluxo “registrar → chegar ao púlpito → marcar como anunciado” é uma boa base e não deve ser substituído por uma arquitetura mais complexa.
- A identidade em azul-marinho, branco e âmbar é coerente com o produto. Não é necessário transformar o app em um design genérico novo.
- O suporte offline-first é uma característica importante e deve ser preservado.

## Problema central

O aplicativo está visualmente mais maduro do que sua arquitetura de informação. O maior problema não é aparência, mas o fato de várias funções, responsabilidades e atalhos aparecerem simultaneamente para todos.

Hoje o usuário encontra as mesmas funções no cabeçalho, na Home, em cards de atalho, no menu do perfil e em Ajustes. Isso aumenta carga cognitiva e reduz a objetividade, especialmente em celulares e para pessoas leigas.

A implementação também contém problemas de autorização, estado inicial e integridade de dados que podem gerar ações erradas ou fazer dados de demonstração parecerem reais.

# Prioridade P0 — corrigir antes de qualquer refinamento visual

## 1. Remover dados de demonstração do fluxo de produção

`src/services/storageService.ts` inicializa automaticamente uma lista realista de obreiros, um culto ativo de demonstração, avisos de demonstração e PIN administrativo `1234`. Além disso, os métodos de leitura usam dados de demonstração como fallback quando não encontram armazenamento local ou ocorre erro de parse.

### Resultado esperado

- Produção começa em estado vazio ou em onboarding explícito.
- Dados de demonstração só podem existir em modo de desenvolvimento/demonstração claramente opt-in.
- Erro de leitura de armazenamento não deve ser convertido silenciosamente em informação fictícia.
- Se for necessário preservar instalações existentes, implemente migração compatível em vez de simplesmente apagar armazenamento.

## 2. Não autenticar automaticamente como o primeiro obreiro

`src/context/AuthContext.tsx` retorna `DEFAULT_OBREIROS[0]` quando não existe usuário salvo. Na prática, uma instalação sem usuário persistido pode entrar como o primeiro obreiro sem uma escolha explícita.

### Resultado esperado

- Sem usuário persistido válido, `currentUser` deve ser `null`.
- Exiba identificação/seleção de usuário.
- Se o produto continuar sem autenticação individual real para uso comum, trate a tela como identificação do usuário do aparelho, não como segurança completa.
- Ações administrativas continuam exigindo autorização própria.

## 3. Corrigir permissões das ações críticas

Revise iniciar/encerrar culto, trocar dirigente, administrar obreiros, segurança, nuvem e marcação de avisos. Na Home, “Concluir sessão deste culto” é renderizado sem guarda explícita de `isAdmin`/`isDirigente`; `CultoContext.finalizarCulto()` também não valida quem fez a ação.

### Resultado esperado

- Defina política única de autorização e reutilize em UI e domínio/context.
- Não dependa apenas de esconder botão: a operação deve recusar chamada indevida no nível apropriado.
- Como regra inicial, ações que alteram a sessão do culto devem ser permitidas ao dirigente atual e/ou administrador. Confirme qualquer exceção material antes de codificar.
- Usuário sem permissão não deve receber controles destrutivos ou administrativos que não pode usar.

## 4. Corrigir o swipe global

`src/App.tsx` interpreta swipe horizontal em praticamente qualquer área da tela com limiar baixo. Ele ignora apenas alguns inputs, apesar de diversos componentes usarem `data-no-swipe="true"` e `.no-swipe`.

### Resultado esperado

Prefira remover navegação universal por swipe ou restringi-la a áreas seguras. Se permanecer, respeite `data-no-swipe`, `.no-swipe`, botões, links, selects e regiões roláveis, com bloqueio direcional mais conservador. A navegação nunca deve trocar de módulo enquanto o usuário interage com controle horizontal ou formulário.

## 5. Corrigir o horário do novo culto

`src/components/culto/IniciarCultoModal.tsx` permite editar `horario`, mas `handleIniciar()` não envia esse valor. `src/context/CultoContext.tsx` sempre grava a hora atual.

### Resultado esperado

- Se o campo permanecer, o valor escolhido deve ser validado e persistido.
- Use `input type="time"` quando compatível.
- Se o negócio exige sempre a hora real de abertura, remova o campo editável.

## 6. Corrigir escopo do Histórico e do relatório

`HistoricoScreen.tsx` trabalha diretamente sobre `avisos` globais. Métricas e texto copiado são gerados com todos os avisos, enquanto o cabeçalho do relatório usa a data atual.

### Resultado esperado

- Histórico deve ter noção explícita de sessão/culto.
- O usuário deve conseguir selecionar ou abrir um culto por data/nome/dirigente.
- Métricas, busca e exportação devem respeitar o escopo selecionado.
- O relatório deve informar qual culto/data está sendo exportado.

## 7. Corrigir métricas da Home

`HomeScreen.tsx` calcula as quatro métricas usando `avisos` globais, mesmo existindo no `AvisosContext` contadores baseados em `avisosCultoAtual`.

### Resultado esperado

As métricas de um culto em andamento devem representar somente o culto ativo.

# Prioridade P1 — reorganizar experiência e arquitetura de informação

## 8. Tornar a navegação orientada à tarefa

A estrutura atual expõe quatro abas fixas — Início, Anotação, Púlpito e Histórico — para todos e repete funções em cards e menus.

Preserve os módulos, mas faça a experiência considerar o trabalho da pessoa: recepção/diaconia prioriza Anotação; dirigente prioriza Púlpito; administração prioriza Home/Histórico/Administração. Isso não exige esconder rigidamente os outros módulos.

No mobile, avalie navegação principal no rodapé. Em qualquer alternativa: no máximo quatro destinos primários, ícone + rótulo legível, estado ativo inequívoco, badges apenas operacionais e Ajustes fora da navegação principal.

## 9. Simplificar a Home

A Home deve responder rapidamente: qual culto está ativo, qual é meu contexto agora e qual ação provavelmente preciso executar.

- mantenha status do culto de forma compacta;
- apresente uma ação primária compatível com o contexto;
- mantenha no máximo uma ou duas ações secundárias relevantes;
- remova o grid que repete a navegação principal;
- não repita Ajustes em múltiplos locais;
- mova instalação/download para área secundária;
- exiba encerrar culto apenas a quem pode encerrá-lo.

## 10. Reduzir o cabeçalho fixo

As capturas reais mostram duas linhas permanentes no topo consumindo altura útil do celular.

- preserve identificação do culto e pendências essenciais;
- reduza controles administrativos permanentes;
- evite repetir status e identidade imediatamente no conteúdo da tela.

## 11. Separar Preferências de Administração

`SettingsModal.tsx` mistura perfil, som, tema, texto, APK/PWA, dirigente, obreiros, PIN e Firestore JSON. Nas capturas reais, abas horizontais ficam parcialmente cortadas no celular.

Organize em Preferências; Conta/Identificação; Administração do culto; Administração de pessoas; Segurança; Sistema avançado.

A configuração JSON do Firebase não deve aparecer como configuração comum para usuário leigo. Prefira configuração de implantação por variáveis de ambiente. Se configuração em runtime for requisito real, coloque-a em Sistema avançado protegido, com validação, status e explicação de impacto.

## 12. Clarificar identificação versus autenticação

A seleção de nome é mais próxima de identificação operacional do que login seguro.

- remova do placeholder qualquer exposição de PIN padrão;
- cadastro de novo obreiro não deve ficar livre sem autorização adequada;
- não comunique a seleção simples de nome como proteção de segurança;
- ações privilegiadas devem ter autorização independente.

## 13. Refinar linguagem operacional

- Prefira “Administrador” a “MASTER” se a badge precisar existir.
- “Copiar para WhatsApp” deve ser “Copiar relatório” se a ação apenas copia para clipboard. Se possível, ofereça Compartilhar separadamente.
- Não use “Guarda permanente” se a persistência não for realmente garantida.
- Revise “No Púlpito” em itens pendentes; prefira algo como “Aguardando anúncio” ou “Enviado ao púlpito”.
- Use rótulos de ação específicos e compreensíveis sem conhecimento técnico.

# Prioridade P2 — formulários, histórico e refinamento visual

## 14. Não fabricar valores de campos opcionais

Em `FormVisitante.tsx`, cidade vazia vira `Auriflama` e igreja vazia vira `Primeira Visita`.

Campo não informado não deve virar fato presumido. Preserve vazio/`undefined` ou ofereça opção explícita escolhida pelo usuário.

## 15. Simplificar formulário de reunião

O formulário apresenta simultaneamente muitos grupos, dias e horários.

Organize a hierarquia como: Qual reunião? → Quando? → Onde? → Responsável. Pode continuar em uma tela, usando divulgação progressiva quando necessário.

## 16. Persistir datas reais

Não armazene apenas expressões como “Próxima Terça-feira” ou “Próximo Domingo”. Elas ficam ambíguas no histórico.

- armazene data absoluta em formato apropriado;
- renderize texto amigável na interface;
- prefira controles nativos `date`/`time` quando melhorarem a confiabilidade;
- preserve compatibilidade/migre registros antigos.

## 17. Revisar opções que não afetam o destino

Antes de manter categorias extras, confirme onde são usadas. Se categoria de oração ou público-alvo do comunicado não influenciar Púlpito, Histórico, filtro, relatório ou regra real, não obrigue o usuário a escolher algo sem efeito.

## 18. Melhorar correção de aviso recém-enviado

`MeusAvisosHoje` já oferece cancelamento de pendente, o que é bom. Avalie permitir edição de aviso ainda não anunciado ou oferecer “Desfazer/Editar” logo após envio, sem criar complexidade excessiva.

Substitua `window.confirm`/`alert` por feedback consistente com a interface quando houver benefício real.

## 19. Organizar Histórico por culto

A entrada do Histórico deve priorizar sessões de culto, por exemplo:

- `30/08/2026 — Culto da Família` — dirigente — 8 registros;
- `27/08/2026 — Culto de Doutrina` — dirigente — 5 registros.

Ao abrir um culto, mostre métricas, filtros, busca e registros daquele escopo. Preserve uma forma de consulta global apenas se houver necessidade real.

## 20. Criar modo focado de Púlpito

O Púlpito é visualmente uma das partes mais fortes e não deve ser redesenhado indiscriminadamente.

Adicione ou refine um modo de leitura com mínimo de chrome: nome/status do culto, quantidade pendente, controles de fonte, alternância Para Ler/Já Lidos e cards. Mantenha forma clara de sair do modo focado.

## 21. Refinar densidade visual sem trocar identidade

Preserve azul-marinho, âmbar, cores de categoria e alta legibilidade do Púlpito.

Reduza containers, cards, badges, sombras e gradientes quando não agruparem informação ou ação. Evite textos operacionais importantes em 9–10 px. Garanta alvos touch de aproximadamente 44 px. Considere `prefers-reduced-motion` para animações repetitivas.

# Regras de implementação

1. Explore o estado atual do repositório antes de editar. Não assuma que este documento substitui o código.
2. Para mudanças de dados, autorização, histórico ou navegação, produza primeiro um plano curto citando arquivos e efeitos esperados.
3. Implemente por fases, começando por P0. Não faça uma reescrita total do aplicativo em uma única alteração.
4. Preserve offline-first.
5. Não introduza backend novo, framework novo, biblioteca de UI ou gerenciador de estado apenas para executar este plano.
6. Preserve dados reais existentes sempre que possível. Mudança de schema exige estratégia de compatibilidade/migração.
7. Não trate dados de demonstração como dados reais durante migração.
8. Não transforme o app em painel corporativo genérico. A linguagem deve continuar adequada à igreja e a pessoas não técnicas.
9. Não reduza a legibilidade do Púlpito em nome de densidade.
10. Não adicione animações decorativas. Movimento deve comunicar estado ou transição.
11. Não peça ao usuário informações que podem ser confirmadas diretamente no repositório.
12. Se uma decisão mudar materialmente quem pode executar uma ação, o significado dos dados ou o fluxo do culto, trate-a como decisão de produto bloqueante e confirme antes de assumir.

# Execução sugerida

## Fase 1 — integridade e autorização

Corrija P0: estado inicial/dados demo, identidade padrão, permissões, horário do culto, métricas, histórico/relatório e swipe. Acrescente testes quando a estrutura atual permitir sem expansão desproporcional.

## Fase 2 — arquitetura mobile

Reorganize navegação, Home, cabeçalho e separação entre preferências/administração. Valide em viewport real de celular antes de continuar.

## Fase 3 — captura de informações

Refine formulários, datas/horários, defaults e recuperação/edição de registros pendentes. Preserve velocidade de entrada.

## Fase 4 — Histórico e Púlpito

Implemente histórico por culto e modo focado de leitura sem degradar o fluxo atual do Púlpito.

## Fase 5 — polish

Somente após fluxos e estados estarem corretos, refine densidade, tipografia, containers, motion, mensagens e acessibilidade.

# Validação

Execute no mínimo:

```bash
npm run lint
npm run build
```

Corrija erros antes de concluir.

Faça inspeção visual e funcional em viewport mobile estreito, incluindo aproximadamente 360 px de largura, e em um viewport maior. Não valide UI apenas pela leitura do JSX.

Valide manualmente estes cenários:

1. instalação/armazenamento novo sem dados;
2. identificação como usuário comum;
3. tentativa de ação administrativa sem permissão;
4. administrador iniciando culto;
5. horário escolhido versus horário persistido;
6. diácono registrando cada um dos quatro tipos;
7. aviso chegando ao Púlpito;
8. dirigente marcando como anunciado;
9. recuperação de item marcado por engano;
10. cancelamento/edição de pendente, se implementado;
11. encerramento de culto por autorizado e bloqueio para não autorizado;
12. abertura de novo culto sem misturar pendências do anterior;
13. Histórico de pelo menos dois cultos diferentes;
14. relatório/exportação de um culto específico;
15. recarga do aplicativo offline;
16. interação com chips/seletores sem navegação acidental por swipe;
17. teclado aberto em formulários sem esconder ação crítica;
18. tema claro e escuro;
19. tamanhos de fonte disponíveis;
20. estados vazio, sucesso, erro e ausência de culto ativo.

# Critério de pronto

A implementação só está concluída quando:

- uma instalação nova não apresenta pessoas, cultos ou avisos fictícios como produção;
- ninguém é implicitamente autenticado como o primeiro obreiro;
- ações críticas possuem autorização no comportamento e na UI;
- o campo de horário do culto é verdadeiro ou foi removido;
- métricas e relatórios não misturam cultos;
- histórico possui escopo de culto compreensível;
- interações horizontais não causam mudança acidental de módulo;
- usuário de recepção consegue registrar um aviso com menos distrações do que na versão atual;
- dirigente consegue operar o Púlpito sem chrome administrativo desnecessário;
- configurações técnicas não competem com preferências comuns;
- dados opcionais não são fabricados silenciosamente;
- datas futuras continuam compreensíveis quando vistas posteriormente;
- identidade visual reconhecível do IPRA Avisos foi preservada;
- `npm run lint` e `npm run build` passam;
- os fluxos críticos foram conferidos visualmente em mobile realista.

Ao finalizar cada fase, informe arquivos alterados, comportamento antes/depois, validações executadas e qualquer decisão de produto que ainda dependa de confirmação.