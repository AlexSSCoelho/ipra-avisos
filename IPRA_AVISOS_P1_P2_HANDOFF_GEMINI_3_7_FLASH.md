# IPRA Avisos — handoff de P1/P2 para Gemini 3.7 Flash no Antigravity

# Objetivo

Continuar a implementação do IPRA Avisos na branch `implementacao-fases`, preservando o P0 já encerrado e corrigindo uma última rodada curta de P1 antes de iniciar P2.

O executor é **Gemini 3.7 Flash no Google Antigravity**.

Use este arquivo em conjunto com `IPRA_AVISOS_UX_IMPLEMENTATION_GEMINI_3_7_FLASH.md`. O plano principal continua sendo a fonte de requisitos; este handoff registra o estado real da branch e as correções pontuais necessárias antes de P2.

# Baselines

Branch: `implementacao-fases`

P0 encerrado: `e361d90a5455464a3d06070007836ad476529769`

Primeira implementação de P1 revisada: `168a766f1852d2f99901a2906af81a83ced943de`

P0 é baseline estável. Não refaça bootstrap, autorização, PIN, escopo do culto, swipe, horário ou regras de exclusão de aviso salvo regressão concreta reproduzida.

# Invariantes de P0

- instalação nova começa sem dados fictícios;
- primeiro uso usa bootstrap explícito do primeiro administrador;
- não existe PIN padrão/fallback `1234`;
- PIN administrativo é numérico e tem no mínimo 4 dígitos;
- `isAdmin` é permissão explícita; cargo não concede administração em novos registros;
- migração legada só promove registros antigos quando `isAdmin` estava realmente ausente, preservando `isAdmin: false`;
- `currentUser` é sincronizado com o registro migrado correspondente;
- `addObreiro()` normal não possui bypass público;
- instalação existente com administrador e sem PIN possui fluxo explícito para configurar o primeiro PIN;
- dirigente já definido pode se identificar sem redigitar PIN; troca real de dirigente continua autorizada;
- `setDirigenteDoCulto()` nunca cria culto;
- apenas administrador inicia novo culto;
- apenas dirigente atual ou administrador encerra culto em andamento;
- encerrar sem culto ou culto já finalizado retorna falha;
- horário escolhido no início do culto é persistido;
- métricas e avisos operacionais usam o culto atual;
- relatório P0 não mistura cultos;
- swipe respeita controles/`no-swipe`;
- autor pode cancelar o próprio aviso pendente; dirigente/admin podem cancelar pendente conforme regra; anunciado não é apagado pelo fluxo comum.

# Estado atual da P1

A primeira implementação de P1 trouxe ganhos reais e deve ser preservada:

- bottom navigation com quatro destinos principais;
- destino inicial contextual após identificação: dirigente → Púlpito, diácono/diaconisa → Anotação, demais → Home;
- cabeçalho mais compacto;
- Home significativamente simplificada;
- nomenclatura de Ajustes e administração melhorada;
- checklists foram atualizados no commit da P1, mas **P1 não deve ser tratada como concluída até a rodada abaixo ser implementada e validada**.

Não reverta a bottom navigation nem restaure o cabeçalho antigo.

# Correções pontuais finais da P1

Trate os cinco itens abaixo como o escopo completo desta rodada. **Não iniciar P2 no mesmo commit.**

## 1. Tornar a prioridade da Home realmente contextual

No estado atual, quando existe culto em andamento, a Home mostra sempre:

1. `Anotar Novo Aviso` como ação visualmente primária;
2. `Abrir Púlpito do Altar` como ação secundária.

Isso atende bem à recepção/diaconia, mas não ao dirigente atual.

### Resultado esperado

- se `isDirigente === true`, **Púlpito** deve ser a ação primária visual e operacional;
- para diácono/diaconisa, **Anotação** permanece como ação primária;
- para administrador que não está dirigindo, mantenha Home como hub equilibrado, sem assumir que ele está operando o Púlpito;
- não crie três Homes diferentes; apenas ajuste prioridade/ordem/ênfase conforme contexto;
- preserve acesso aos outros módulos via bottom navigation.

Arquivos prioritários: `src/components/home/HomeScreen.tsx`, eventualmente `src/App.tsx` apenas se necessário para fornecer contexto já existente.

## 2. Corrigir UI de `Iniciar Novo Culto`

No `Header`, a ação `Iniciar Novo Culto` aparece para `(isAdmin || isDirigente)`, mas o domínio P0 permite iniciar culto somente a administrador.

### Resultado esperado

- renderizar essa ação somente para `isAdmin`;
- não afrouxar `CultoContext.iniciarNovoCulto()`;
- UI e domínio devem comunicar a mesma permissão.

Arquivo prioritário: `src/components/common/Header.tsx`.

## 3. Tratar corretamente culto finalizado na Home e no Header

`finalizarCulto()` persiste o culto com `status: 'finalizado'`; portanto `cultoAtivo !== null` não significa que existe culto em andamento.

No estado atual, Home/Header podem tratar qualquer objeto `cultoAtivo` como sessão ativa.

### Resultado esperado

Use explicitamente um estado equivalente a:

```ts
const cultoEmAndamento = cultoAtivo?.status === 'em_andamento';
```

- Header só deve exibir indicador de culto ativo quando `status === 'em_andamento'`;
- Home só deve mostrar card `Culto em Andamento`, métricas operacionais, ações de anotação/Púlpito e encerramento quando a sessão estiver realmente em andamento;
- culto finalizado deve cair no estado sem sessão ativa, sem dizer que está em andamento;
- não apague automaticamente o culto finalizado para resolver UI; Histórico P2 ainda poderá precisar desse estado/dado.

Arquivos prioritários: `src/components/common/Header.tsx`, `src/components/home/HomeScreen.tsx`.

## 4. Remover duplicação desnecessária de Ajustes

Após P1, Ajustes ainda aparece em múltiplos lugares: botão fixo no Header, item do menu do usuário e botão adicional na Home.

### Resultado esperado

- remova o acesso redundante da Home;
- mantenha um acesso principal previsível no Header/perfil;
- se Header e menu do perfil continuarem oferecendo caminhos para a mesma área, evite que ambos tenham o mesmo peso visual; o Header pode manter o acesso direto e o menu servir como contexto/perfil;
- não adicione novo atalho substituto em outra área.

Arquivo prioritário: `src/components/home/HomeScreen.tsx`; revisar `Header.tsx` apenas para coerência.

## 5. Separar melhor Preferências de Administração

A primeira P1 renomeou as abas do `SettingsModal`, mas continua expondo uma única faixa horizontal de cinco áreas administrativas/técnicas dentro do mesmo modal:

- Preferências;
- Dirigente;
- Obreiros;
- Segurança & PIN;
- Nuvem & Sistema.

Isso ainda mistura uso cotidiano com administração e mantém a navegação horizontal como principal estrutura do modal.

### Resultado esperado

Não é obrigatório criar uma nova arquitetura de rotas ou vários modais. Faça a menor alteração que produza uma separação mental clara:

- **Preferências / Identificação** devem formar a área comum;
- **Administração** deve ser apresentada como área separada, disponível apenas a admin;
- dentro de Administração, podem existir subseções para Culto/Dirigente, Pessoas, Segurança e Sistema avançado;
- Firebase/runtime JSON, se permanecer, deve estar claramente em **Sistema avançado**, não ao lado de preferências comuns;
- evite depender de uma faixa horizontal longa como único mecanismo de organização em ~360 px;
- preserve todos os contratos de segurança do P0.

Você pode manter `SettingsModal.tsx` como componente único se a hierarquia ficar clara no render. Não faça refatoração estrutural grande apenas para dividir arquivos.

Arquivo prioritário: `src/components/configuracoes/SettingsModal.tsx`.

# O que não alterar nesta rodada

- bottom navigation atual, salvo correção necessária para regressão concreta;
- destino inicial contextual de login já implementado;
- AuthContext, bootstrap, PIN e migrações P0;
- regras de dirigente/início/encerramento no domínio;
- formulários de visitante/oração/reunião/comunicado;
- Histórico por sessões;
- modo focado do Púlpito;
- schema de storage;
- P2 em geral.

# Validação obrigatória da P1 corretiva

Execute:

```bash
npm run lint
npm run build
```

Além disso valide no render real, incluindo aproximadamente 360 px:

1. dirigente com culto em andamento abre Home → Púlpito aparece como ação primária;
2. diácono/diaconisa com culto em andamento → Anotação permanece primária;
3. administrador não dirigente mantém acesso equilibrado aos módulos;
4. dirigente não administrador não vê `Iniciar Novo Culto` no Header/menu;
5. administrador vê `Iniciar Novo Culto`;
6. após encerrar culto, Home e Header não continuam mostrando `Culto em Andamento`;
7. culto finalizado não libera ações operacionais como se ainda estivesse ativo;
8. Home não repete botão de Ajustes já disponível no Header/perfil;
9. usuário comum encontra Preferências/Identificação sem navegar por controles administrativos;
10. administrador distingue claramente área comum de área administrativa;
11. Firebase/configuração técnica está em Sistema avançado;
12. Settings continua utilizável sem truncamento problemático em ~360 px;
13. bottom navigation continua funcional;
14. Púlpito e Anotação continuam acessíveis;
15. invariantes P0 continuam válidos.

# Critério de pronto da P1

Considere P1 encerrada somente quando:

- a Home prioriza a próxima ação conforme o contexto do usuário;
- UI de iniciar culto corresponde à autorização real do domínio;
- culto finalizado não é apresentado como ativo;
- duplicação de Ajustes foi reduzida;
- Preferências e Administração são mental e visualmente distintas;
- bottom navigation e cabeçalho compacto permanecem estáveis;
- não houve regressão de P0;
- `npm run lint` e `npm run build` passam;
- interface foi conferida em mobile estreito.

Ao concluir, atualize os checklists Gemini e Sonnet marcando P1 como concluída somente após esta rodada. Faça um commit separado na branch `implementacao-fases` e não inicie P2 nesse mesmo commit.

# Contexto de P2 — usar apenas depois de fechar P1

## Formulários

- `FormVisitante.tsx`: não fabricar `Auriflama`/`Primeira Visita` quando campos opcionais estiverem vazios;
- `FormReuniao.tsx`: reduzir carga cognitiva e persistir datas absolutas;
- `FormOracao.tsx` e `FormAvisoGeral.tsx`: antes de remover categorias/públicos, localizar onde esses campos são realmente usados;
- `MeusAvisosHoje.tsx`: cancelamento de pendente já existe; P2 pode avaliar edição/desfazer enquanto pendente sem permitir alteração silenciosa de anunciado.

## Histórico

O P0 restringiu a visão atual ao culto corrente apenas para impedir mistura incorreta. Isso não é o Histórico final.

P2 deve implementar Histórico real por culto/sessão, preservando registros antigos. Antes de mudar UI, determine como o storage enumera cultos finalizados. Se faltar catálogo, implemente a menor extensão compatível possível.

## Púlpito

Preserve tipografia, hierarquia, cores de categoria, Para Ler/Já Lidos, marcação e desfazer. O modo focado deve reduzir chrome, não redesenhar os cards por estética.

# Restrições gerais para P2

- preservar offline-first;
- não reescrever arquitetura inteira;
- não trocar React/Vite/Capacitor/Firebase;
- não adicionar UI library/state manager por conveniência;
- não quebrar storage sem migração;
- não transformar o app em dashboard genérico;
- não degradar legibilidade do Púlpito;
- executar e validar P2 por subfases, com commits revisáveis.
