# IPRA Avisos — plano de implementação UX para Claude Sonnet 4.6 no Antigravity

# Objetivo

Evoluir o aplicativo `AlexSSCoelho/ipra-avisos` a partir de uma auditoria conjunta do código real e de 15 capturas reais do aplicativo em Android, melhorando principalmente experiência de usuários leigos, arquitetura de informação, separação de responsabilidades, permissões, confiabilidade dos dados, navegação mobile, legibilidade e eficiência operacional.

O executor desta especificação é **Claude Sonnet 4.6 (Thinking) no Google Antigravity**.

A intenção não é redesenhar o produto por estética. A identidade visual atual é coerente e vários fluxos já funcionam bem, sobretudo a leitura no Púlpito. Preserve o que é claro e reconhecível. Priorize primeiro problemas de produto, fluxo e confiabilidade; refinamentos visuais vêm depois.

Faça apenas as alterações necessárias para cumprir os requisitos desta especificação. Não adicione funcionalidades, dependências, abstrações, refatorações ou redesigns fora do escopo, salvo quando forem indispensáveis para corrigir um problema diretamente relacionado.

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

## Princípio do produto

O fluxo central deve permanecer simples:

**registrar → chegar ao púlpito → anunciar → registrar como concluído**.

Administração, configuração e histórico são funções de apoio. Não deixe essas funções competirem visualmente com o trabalho operacional durante o culto.

## Stack e comandos existentes

Não troque a stack nem introduza biblioteca de UI sem necessidade real.

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

Não assuma que este documento substitui o código. Primeiro confirme o estado atual do repositório.

# Diagnóstico consolidado

## O que já funciona e deve ser preservado

- A divisão conceitual entre **Anotação**, **Púlpito** e **Histórico** é fácil de entender.
- Os quatro tipos de registro usam linguagem compatível com o domínio da igreja.
- O Púlpito possui boa hierarquia visual, tipografia grande, categorias reconhecíveis e uma ação primária evidente para marcar como anunciado.
- A indicação de pendências e a separação entre “para ler” e “já lidos” dão segurança operacional.
- O fluxo “registrar → chegar ao púlpito → marcar como anunciado” é uma boa base e não deve ser substituído por arquitetura mais complexa.
- A identidade em azul-marinho, branco e âmbar é coerente com o produto.
- O suporte offline-first é importante e deve ser preservado.

## Problema central

O aplicativo está visualmente mais maduro do que sua arquitetura de informação. O maior problema não é aparência, mas o fato de funções, responsabilidades e atalhos aparecerem simultaneamente para todos.

Hoje o usuário encontra as mesmas funções no cabeçalho, Home, cards de atalho, menu do perfil e Ajustes. Isso aumenta carga cognitiva e reduz objetividade, especialmente em celulares e para pessoas leigas.

Também existem problemas de autorização, estado inicial e integridade de dados que podem produzir ações erradas ou fazer dados de demonstração parecerem reais.

# Escopo e restrições gerais

- Preserve a identidade visual reconhecível do app.
- Preserve o fluxo operacional básico de Anotação → Púlpito.
- Preserve offline-first.
- Não troque React, Vite, Capacitor, Firebase ou a arquitetura inteira sem necessidade demonstrável.
- Não adicione nova biblioteca de UI apenas para executar este plano.
- Não transforme o app em dashboard corporativo genérico.
- Não reduza a legibilidade do Púlpito em nome de densidade.
- Mudança de schema exige compatibilidade ou migração consciente.
- Não trate dado fictício como dado real durante migração.
- Não aproveite esta tarefa para refatorar módulos não relacionados.

# Prioridade P0 — corrigir antes de qualquer refinamento visual

## 1. Remover dados de demonstração do fluxo de produção

`src/services/storageService.ts` inicializa automaticamente uma lista realista de obreiros, um culto ativo de demonstração, avisos de demonstração e PIN administrativo `1234`. Os métodos de leitura também usam dados de demonstração como fallback quando não encontram armazenamento local ou ocorre erro de parse.

### Resultado esperado

- Produção começa em estado vazio ou onboarding explícito.
- Dados de demonstração só existem em modo de desenvolvimento/demonstração claramente opt-in.
- Erro de leitura não vira silenciosamente informação fictícia.
- Instalações existentes não devem perder dados reais sem estratégia de migração.

## 2. Não identificar automaticamente como o primeiro obreiro

`src/context/AuthContext.tsx` retorna `DEFAULT_OBREIROS[0]` quando não existe usuário salvo.

### Resultado esperado

- Sem usuário persistido válido, `currentUser` deve ser `null`.
- Exiba identificação/seleção de usuário.
- Se o uso comum continuar sem autenticação individual real, trate essa tela como identificação operacional, não como segurança completa.
- Ações administrativas exigem autorização própria.

## 3. Corrigir permissões das ações críticas

Revise:

- iniciar novo culto;
- encerrar culto;
- trocar dirigente;
- cadastrar/administrar obreiros;
- alterar segurança;
- configurar nuvem;
- marcar/desmarcar avisos como anunciados.

Na Home, “Concluir sessão deste culto” é renderizado sem guarda explícita de `isAdmin`/`isDirigente`; `CultoContext.finalizarCulto()` também não valida quem fez a ação.

### Resultado esperado

- Defina política única de autorização e reutilize em UI e domínio/context.
- Não dependa apenas de esconder botão: a operação também deve recusar chamada indevida no nível apropriado.
- Como regra inicial, ações que alteram a sessão do culto devem ser permitidas ao dirigente atual e/ou administrador.
- Se houver ambiguidade material sobre quem deve ter determinada permissão, trate isso como decisão de produto e peça confirmação antes de assumir.

## 4. Corrigir o swipe global

`src/App.tsx` interpreta swipe horizontal em praticamente qualquer área da tela com limiar baixo, mas diversos componentes já usam `data-no-swipe="true"` e `.no-swipe` sem que o handler global respeite isso.

### Resultado esperado

Prefira a solução mais previsível:

1. remover navegação universal por swipe; ou
2. manter swipe apenas em áreas seguras, respeitando `data-no-swipe`, `.no-swipe`, botões, links, selects, regiões roláveis e formulários, com bloqueio direcional mais conservador.

A navegação nunca deve trocar de módulo durante interação horizontal com um controle.

## 5. Corrigir o horário do novo culto

`src/components/culto/IniciarCultoModal.tsx` permite editar `horario`, mas `handleIniciar()` não envia esse valor e `src/context/CultoContext.tsx` grava a hora atual.

### Resultado esperado

- Se o campo permanecer, o valor escolhido deve ser validado e persistido.
- Use `input type="time"` quando fizer sentido.
- Se o negócio exige sempre a hora real de abertura, remova o campo editável.

## 6. Corrigir escopo do Histórico e do relatório

`HistoricoScreen.tsx` trabalha sobre `avisos` globais. Métricas e relatório incluem todos os registros, enquanto o cabeçalho usa a data atual.

### Resultado esperado

- Histórico deve ter noção explícita de sessão/culto.
- Usuário consegue selecionar ou abrir um culto por data/nome/dirigente.
- Métricas, busca e exportação respeitam o culto selecionado.
- O relatório informa claramente culto e data exportados.
- Se uma visão global existir, ela deve ser rotulada como global.

## 7. Corrigir métricas da Home

`HomeScreen.tsx` calcula métricas usando `avisos` globais, apesar de o `AvisosContext` já possuir contadores do culto atual.

### Resultado esperado

Métricas do culto em andamento representam apenas o culto ativo.

# Prioridade P1 — reorganizar experiência e arquitetura de informação

## 8. Tornar a navegação orientada à tarefa

A estrutura atual expõe quatro abas fixas — Início, Anotação, Púlpito e Histórico — para todos e repete as mesmas funções em outros lugares.

### Direção esperada

Preserve os módulos conceituais, mas priorize o contexto de trabalho:

- recepção/diaconia → Anotação mais imediata;
- dirigente → Púlpito mais imediato;
- administração → Home/Histórico/Administração com maior relevância.

Não é necessário esconder rigidamente todos os outros módulos; uma pessoa pode acumular funções. O objetivo é reduzir distração e impedir ações sem autorização.

No mobile, avalie navegação principal no rodapé se isso reduzir altura de chrome e melhorar alcance do polegar. Não implemente bottom navigation apenas por tendência: compare com a estrutura atual renderizada e escolha a opção que objetivamente melhora o uso.

Em qualquer alternativa:

- no máximo quatro destinos primários;
- ícone + rótulo legível;
- estado ativo inequívoco;
- badges apenas quando informam algo operacional;
- Ajustes fora da navegação principal.

## 9. Simplificar a Home

A Home atual mostra identidade, culto, dirigente, quatro métricas, ações principais, encerramento, atalhos repetidos, Ajustes e instalação.

### Resultado esperado

A Home deve responder rapidamente:

1. qual culto está ativo;
2. qual é meu contexto agora;
3. qual é a ação mais provável que preciso executar.

Recomendações:

- status do culto compacto;
- uma ação primária compatível com o contexto;
- no máximo uma ou duas ações secundárias relevantes;
- remover grid que apenas repete a navegação principal;
- não repetir Ajustes em múltiplos locais;
- mover instalação/download para área secundária;
- encerrar culto apenas para autorizado.

## 10. Reduzir o cabeçalho fixo

As capturas reais mostram duas linhas permanentes no topo consumindo parte relevante do viewport.

### Resultado esperado

- Preserve informação essencial do culto.
- Reduza controles administrativos permanentes.
- Evite repetir status e identidade imediatamente no conteúdo.
- Corrija truncamentos em larguras próximas de 360 px.

## 11. Separar Preferências de Administração

`SettingsModal.tsx` mistura perfil, som, tema, tamanho de texto, APK/PWA, dirigente, obreiros, PIN e Firestore JSON. Nas capturas reais, as próprias abas ficam parcialmente cortadas.

### Organização recomendada

**Preferências**
- som;
- tema;
- tamanho do texto;
- informações/instalação do app.

**Identificação**
- usuário atual;
- trocar usuário.

**Administração do culto**
- dirigente;
- iniciar/encerrar culto.

**Administração de pessoas**
- obreiros;
- permissões;
- editar/ativar/desativar se o modelo suportar.

**Segurança**
- PIN e regras de autorização.

**Sistema avançado**
- sincronização e diagnóstico, se realmente necessário.

A configuração JSON do Firebase não deve aparecer como configuração comum para usuário leigo. Prefira configuração de implantação por variáveis de ambiente. Se runtime config for requisito real, mantenha-a em área avançada protegida e com validação.

## 12. Clarificar identificação versus autenticação

A seleção de nome é mais próxima de identificação operacional do que login seguro.

### Resultado esperado

- remover exposição do PIN padrão no placeholder;
- cadastro de obreiro exige autorização adequada;
- não comunicar seleção simples de nome como proteção de segurança;
- ações privilegiadas usam autorização independente.

## 13. Refinar linguagem operacional

Revise textos que induzem interpretação errada:

- “MASTER” → preferir “Administrador” se a badge for necessária;
- “Copiar para WhatsApp” → “Copiar relatório” se só copia para clipboard;
- opcionalmente “Compartilhar” como ação separada se a plataforma permitir;
- “Guarda permanente” só pode permanecer se persistência for realmente garantida;
- “No Púlpito” em pendentes → preferir “Aguardando anúncio” ou “Enviado ao púlpito”.

# Prioridade P2 — formulários, histórico e refinamento visual

## 14. Não fabricar valores de campos opcionais

Em `FormVisitante.tsx`, cidade vazia vira `Auriflama` e igreja vazia vira `Primeira Visita`.

### Resultado esperado

Ausência de informação deve permanecer ausência (`undefined`/vazio) ou resultar de escolha explícita do usuário. Não transforme campo omitido em fato presumido.

## 15. Simplificar formulário de reunião

O formulário apresenta muitos grupos, dias e horários simultaneamente.

### Resultado esperado

Organize a hierarquia como:

**Qual reunião? → Quando? → Onde? → Responsável**

Pode continuar em uma única tela. Use progressive disclosure quando realmente reduzir carga cognitiva; não transforme o fluxo simples em wizard desnecessário.

## 16. Persistir datas reais

Não armazene apenas expressões relativas como “Próxima Terça-feira” ou “Próximo Domingo”.

### Resultado esperado

- armazene data absoluta em formato adequado;
- renderize texto amigável na UI;
- prefira `date`/`time` quando melhorarem confiabilidade;
- preserve/migre registros antigos de forma compatível.

## 17. Revisar opções que não afetam o destino

Antes de manter categorias extras, confirme onde são utilizadas. Se categoria de oração ou público-alvo do comunicado não influenciar Púlpito, Histórico, filtros, relatório ou regra real, não obrigue o usuário a escolher algo sem efeito.

Não remova campo apenas por parecer redundante: confirme suas referências no repositório primeiro.

## 18. Melhorar correção de aviso recém-enviado

`MeusAvisosHoje` já oferece cancelamento de pendente.

Avalie, sem adicionar complexidade excessiva:

- edição enquanto ainda pendente; ou
- ação rápida “Desfazer/Editar” logo após envio.

Substitua `window.confirm`/`alert` por feedback consistente quando isso trouxer ganho real de clareza.

## 19. Organizar Histórico por culto

A entrada do Histórico deve priorizar sessões de culto, por exemplo:

- `30/08/2026 — Culto da Família` — dirigente — 8 registros;
- `27/08/2026 — Culto de Doutrina` — dirigente — 5 registros.

Ao abrir um culto, mostre métricas, filtros, busca e registros daquele escopo.

Preserve consulta global apenas se houver necessidade real.

## 20. Criar modo focado de Púlpito

O Púlpito é uma das partes visualmente mais fortes. Não o redesenhe indiscriminadamente.

### Resultado esperado

Modo de leitura com mínimo de chrome:

- nome/status do culto;
- quantidade pendente;
- tamanho da fonte;
- Para Ler/Já Lidos;
- cards;
- forma clara de sair do modo focado.

A legibilidade continua tendo prioridade sobre densidade.

## 21. Refinar densidade visual sem trocar identidade

Preserve azul-marinho, âmbar, cores de categoria e alta legibilidade do Púlpito.

Reduza containers, cards, badges, sombras e gradientes somente quando não estiverem agrupando informação ou ação. Evite texto operacional importante em 9–10 px. Garanta alvos touch próximos de 44 px. Considere `prefers-reduced-motion` para animações repetitivas.

# Execução

## Fase 1 — explorar e planejar P0

Antes de editar:

1. confirme o estado atual dos arquivos diretamente relacionados aos P0;
2. localize referências aos schemas de culto, aviso, obreiro e persistência;
3. identifique risco de migração em dados reais existentes;
4. produza um plano curto citando arquivos e efeitos esperados.

Não faça varredura ampla sem propósito. Expanda a busca apenas quando uma referência encontrada demonstrar efeito colateral relevante.

## Fase 2 — implementar integridade e autorização

Implemente P0 primeiro. Mantenha alterações focadas e compatíveis com a arquitetura existente.

Se uma decisão material de produto for necessária — por exemplo, exatamente quais papéis podem encerrar culto — peça confirmação antes de escolher arbitrariamente.

## Fase 3 — arquitetura mobile

Depois de P0 validado, reorganize navegação, Home, cabeçalho e separação entre Preferências/Administração.

Inspecione a interface renderizada; não determine qualidade visual apenas pelo JSX.

## Fase 4 — captura de informações

Refine formulários, datas/horários, defaults e recuperação/edição de registros pendentes.

Priorize velocidade de entrada e redução de erro.

## Fase 5 — Histórico e Púlpito

Implemente Histórico por culto e modo focado de Púlpito sem degradar o fluxo atual.

## Fase 6 — polish

Somente depois dos fluxos e estados estarem corretos, refine densidade, tipografia, motion, mensagens e acessibilidade.

Não use esta fase como oportunidade para redesign total.

# Validação

Execute no mínimo:

```bash
npm run lint
npm run build
```

Corrija falhas antes de concluir.

Faça inspeção visual e funcional em viewport mobile estreito, incluindo aproximadamente 360 px de largura, e em viewport maior.

Valide manualmente:

1. instalação/armazenamento novo sem dados;
2. identificação como usuário comum;
3. tentativa de ação administrativa sem permissão;
4. administrador iniciando culto;
5. horário escolhido versus persistido;
6. diácono registrando os quatro tipos;
7. aviso chegando ao Púlpito;
8. dirigente marcando como anunciado;
9. recuperação de item marcado por engano;
10. cancelamento/edição de pendente, se implementado;
11. encerramento por autorizado e bloqueio para não autorizado;
12. abertura de novo culto sem misturar pendências do anterior;
13. Histórico com pelo menos dois cultos;
14. relatório/exportação de culto específico;
15. recarga offline;
16. chips/seletores sem swipe acidental;
17. teclado aberto sem esconder ação crítica;
18. tema claro e escuro;
19. tamanhos de fonte;
20. estados vazio, sucesso, erro e ausência de culto ativo;
21. ausência de truncamentos relevantes em aproximadamente 360 px.

Para comportamento visual, não considere a tarefa validada apenas porque build e lint passaram.

# Critério de pronto

A implementação só está concluída quando:

- instalação nova não apresenta pessoas, cultos ou avisos fictícios como produção;
- ninguém é implicitamente identificado como o primeiro obreiro;
- ações críticas possuem autorização no comportamento e na UI;
- horário do culto é verdadeiro ou o campo foi removido;
- métricas e relatórios não misturam cultos;
- Histórico possui escopo de culto compreensível;
- interações horizontais não causam mudança acidental de módulo;
- recepção consegue registrar aviso com menos distrações que na versão atual;
- dirigente consegue operar Púlpito sem chrome administrativo desnecessário;
- configurações técnicas não competem com preferências comuns;
- dados opcionais não são fabricados silenciosamente;
- datas futuras continuam compreensíveis posteriormente;
- identidade visual do IPRA Avisos foi preservada;
- `npm run lint` e `npm run build` passam;
- fluxos críticos foram conferidos no render real em mobile realista;
- não foram introduzidas refatorações, dependências ou funcionalidades não relacionadas ao escopo.

Ao finalizar cada fase, informe de forma objetiva:

- arquivos alterados;
- comportamento antes/depois;
- validações executadas;
- qualquer decisão material ainda dependente de confirmação.
