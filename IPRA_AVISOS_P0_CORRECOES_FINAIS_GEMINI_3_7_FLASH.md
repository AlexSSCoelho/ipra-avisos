# IPRA Avisos — correções finais do P0 para Gemini 3.7 Flash no Antigravity

# Objetivo

Concluir exclusivamente os gaps restantes do P0 do IPRA Avisos a partir do estado atual da branch `implementacao-fases`, cujo HEAD revisado é o commit `45a249e9e29d0d0fcccc9c664c4e530d0ac287e7`.

O executor desta especificação é **Gemini 3.7 Flash no Google Antigravity**. Não refaça o P0 já implementado e não avance para P1/P2. Preserve as correções corretas feitas anteriormente pelo Sonnet e altere somente o necessário para fechar os problemas abaixo.

# Contexto relevante

O projeto é `AlexSSCoelho/ipra-avisos`, React + TypeScript + Vite, com Capacitor para Android, `localStorage`/`BroadcastChannel` e sincronização opcional com Firestore. O fluxo operacional central é: recepção/diaconia registra aviso → aviso chega ao Púlpito → dirigente anuncia → status é registrado.

A auditoria inicial identificou problemas de dados demo, autorização, escopo de culto, swipe, horário, histórico e métricas. O commit `793317dfaaf1cf2559f104409ca61970595108a7` corrigiu a maior parte do P0. O commit `45a249e9e29d0d0fcccc9c664c4e530d0ac287e7`, na branch `implementacao-fases`, corrigiu a segunda rodada: removeu o PIN padrão 1234, criou bootstrap inicial, tornou `isAdmin` explícito, impediu `setDirigenteDoCulto()` de criar culto, protegeu exclusão de avisos e endureceu a troca de dirigente.

A revisão do estado final dessa branch encontrou somente os gaps abaixo. Trate-os como o escopo completo desta tarefa.

Arquivos prioritários:

- `src/components/auth/LoginScreen.tsx`
- `src/context/AuthContext.tsx`
- `src/context/CultoContext.tsx`
- `src/services/storageService.ts`
- `src/components/configuracoes/SettingsModal.tsx`
- qualquer chamador direto dos contratos alterados, somente se necessário para manter consistência

Antes de editar, leia o estado real desses arquivos na branch. Não assuma assinaturas apenas com base neste documento.

# Estado do P0 antes desta tarefa

## Concluído e não deve ser desfeito

- [x] dados fictícios de produção removidos;
- [x] instalação nova não autoidentifica primeiro obreiro;
- [x] métricas da Home usam o culto atual;
- [x] horário escolhido para novo culto é persistido;
- [x] swipe global respeita controles e áreas `no-swipe` e está menos sensível;
- [x] relatório não mistura avisos globais com a data atual;
- [x] `setDirigenteDoCulto()` não cria culto;
- [x] fallback e textos de PIN padrão `1234` removidos;
- [x] bootstrap inicial explícito para primeiro administrador + PIN;
- [x] `isAdmin` passou a depender de privilégio explícito;
- [x] cadastro normal de obreiros é administrativo na UI;
- [x] autor/dirigente/admin têm regras de cancelamento de aviso pendente;
- [x] aviso anunciado não pode ser apagado pelo fluxo comum;
- [x] lint e build passaram no commit anterior.

## Ainda pendente

- [ ] dirigente já definido deve conseguir se identificar sem ser bloqueado pela UI por ausência de PIN;
- [ ] remover o bypass público `bypassAdminCheck` de `addObreiro()`;
- [ ] permitir configuração segura do primeiro PIN em instalações existentes que já têm administrador, mas dependiam do antigo fallback 1234;
- [ ] restringir `setInitialPin()`/criação inicial de PIN ao estado de bootstrap ou migração permitido;
- [ ] `finalizarCulto()` deve retornar falha quando não existe culto em andamento;
- [ ] sincronizar `currentUser` com a versão migrada de seu registro quando a migração de `isAdmin` alterar o obreiro persistido.

# Escopo e restrições

- Não avance para navegação, Home, Settings estrutural, formulários, Histórico por sessões ou Púlpito focado.
- Não faça redesign visual.
- Não troque stack, Firebase, storage ou arquitetura geral.
- Não introduza biblioteca de autenticação ou backend novo.
- Não reintroduza PIN padrão ou dados demo.
- Não use flags públicas do tipo `bypass...`, `skipAuth`, `force`, `ignorePermission` para contornar uma regra de domínio.
- Preserve compatibilidade com dados reais existentes.
- Mantenha o app simples; isto é autorização operacional coerente, não uma plataforma enterprise de identidade.
- Não altere código não relacionado apenas para “limpar” ou refatorar.

# Execução

## 1. Corrigir a identificação do dirigente atual sem exigir PIN novamente

No estado atual, `CultoContext.definirDirigente()` já reconhece corretamente que, se `cultoAtivo.dirigenteId === novoDirigente.id`, não há troca real e pode retornar sucesso sem exigir PIN.

Porém `LoginScreen.tsx` exige PIN vazio antes de chamar o contexto sempre que `isDirigindoCulto` está marcado. Isso impede o comportamento correto.

### Resultado esperado

- Se o obreiro selecionado já é o dirigente atual do culto em andamento, ele pode se identificar e ser encaminhado ao Púlpito sem fornecer PIN novamente.
- Se o obreiro selecionado é diferente do dirigente atual e tenta assumir a direção, a autorização continua obrigatória.
- PIN vazio nunca autoriza uma troca real de dirigente.
- A regra de domínio continua protegida no contexto; a UI apenas deixa de bloquear o caso já autorizado.

## 2. Remover `bypassAdminCheck` do contrato público de `addObreiro()`

O estado atual expõe algo equivalente a:

```ts
addObreiro(obreiro, bypassAdminCheck?: boolean)
```

Embora usado pelo bootstrap, qualquer chamador pode passar `true`, o que recria um bypass de autorização no próprio contexto.

### Resultado esperado

- `addObreiro()` normal nunca recebe parâmetro que desligue autorização.
- Fora do bootstrap, somente administrador pode cadastrar obreiro.
- Crie uma operação específica para bootstrap inicial, por exemplo `bootstrapInitialAdmin(...)` ou equivalente coerente com a arquitetura existente.
- Essa operação só pode funcionar quando o estado realmente é de primeira configuração: nenhum obreiro cadastrado e nenhum primeiro administrador já criado.
- Prefira que a operação de bootstrap mantenha invariantes de perfil + PIN de forma coordenada. Não deixe um boolean genérico público contornar autorização.

## 3. Corrigir migração de instalação existente sem PIN configurado

Antes do P0, instalações podiam depender do fallback `1234` sem ter `ADMIN_PIN` persistido. Após removê-lo, pode existir este estado legítimo:

- há obreiros reais existentes;
- há pelo menos um administrador migrado ou explícito;
- `hasPinConfigured === false`;
- `isBootstrap === false` porque já existem obreiros.

Nesse estado o sistema não deve voltar ao `1234`, mas também não pode deixar o administrador sem caminho para criar o primeiro PIN.

### Resultado esperado

- Modele explicitamente o estado “instalação existente com administrador, mas PIN ainda não configurado”.
- Um administrador legitimamente identificado deve poder criar o primeiro PIN sem informar um PIN antigo inexistente.
- Usuário não administrador não pode fazer isso.
- Depois que o PIN existe, qualquer alteração volta a exigir o PIN atual conforme a regra existente.
- Não apague ou recrie obreiros para resolver a migração.
- Não baseie autorização em nome, índice da lista ou cargo novo escolhido pelo usuário.

## 4. Restringir `setInitialPin()` e operações equivalentes

No estado atual, `setInitialPin(pin)` verifica principalmente se ainda não existe PIN. Isso é amplo demais se qualquer consumidor do contexto puder chamá-lo.

### Resultado esperado

A criação de PIN sem PIN anterior só pode ocorrer em um destes estados válidos:

1. bootstrap real de instalação nova, durante a criação do primeiro administrador; ou
2. migração de instalação existente sem PIN, executada por administrador explicitamente autorizado.

Fora desses estados, a operação deve retornar falha e não alterar storage.

Se a solução do item 2 consolidar bootstrap em uma operação específica, prefira reduzir ou eliminar a exposição pública de `setInitialPin()` quando ela deixar de ser necessária.

## 5. Corrigir sucesso falso em `finalizarCulto()`

No estado atual, após verificar permissão, `finalizarCulto()` retorna `{ success: true }` mesmo quando `cultoAtivo` é `null` ou não há sessão em andamento.

### Resultado esperado

- Se não existe culto em andamento, retorne `{ success: false, message: ... }`.
- Se o culto existe mas já está finalizado, também não retorne sucesso de uma operação que nada fez.
- Mantenha a regra atual: apenas dirigente do culto em andamento ou administrador pode encerrar.
- Não modifique storage quando a operação for inválida.

## 6. Sincronizar `currentUser` após migração de `isAdmin`

A migração atual pode atualizar um obreiro persistido antigo para `isAdmin: true`, mas `currentUser` é carregado separadamente do `localStorage` e pode continuar contendo a versão antiga do objeto durante a sessão.

### Resultado esperado

- Depois de migrar a lista de obreiros, se `currentUser.id` existir na lista migrada, sincronize o usuário corrente com a versão persistida/migrada correspondente.
- Atualize também `ipra_current_user_v1` quando necessário.
- Não conceda admin a novos usuários por cargo; esta sincronização serve apenas para refletir a migração de compatibilidade já deliberada.

# Validação

Execute obrigatoriamente:

```bash
npm run lint
npm run build
```

Além disso, valide manualmente ou por testes existentes os seguintes cenários:

1. instalação nova, zero obreiros → bootstrap aparece;
2. bootstrap cria exatamente um primeiro administrador e um PIN válido;
3. não existe API pública de cadastro que aceite flag para ignorar autorização;
4. após bootstrap, usuário comum não cadastra obreiro;
5. administrador cadastra obreiro normalmente;
6. dirigente atual seleciona seu nome, marca que está dirigindo e entra sem redigitar PIN;
7. outro obreiro tenta assumir direção sem PIN → falha;
8. outro obreiro tenta PIN errado → falha;
9. troca autorizada de dirigente continua funcionando;
10. instalação existente com admin e sem PIN consegue criar o primeiro PIN por fluxo explícito de migração;
11. usuário comum nesse mesmo estado não consegue criar PIN;
12. depois do primeiro PIN, mudança de PIN exige o PIN atual;
13. `setInitialPin` ou equivalente falha fora de bootstrap/migração;
14. encerrar sem culto ativo retorna falha;
15. encerrar culto já finalizado retorna falha;
16. dirigente/admin encerram culto em andamento normalmente;
17. usuário comum não encerra culto;
18. usuário migrado para `isAdmin: true` tem `currentUser` sincronizado;
19. criar novo Pastor depois da migração não concede admin automaticamente;
20. regras de exclusão de aviso introduzidas no commit `45a249e` continuam funcionando.

# Critério de pronto

Considere o P0 encerrado somente quando:

- o dirigente atual não é obrigado a reautorizar uma ação que não é troca de dirigente;
- mudança real de dirigente continua protegida;
- não existe `bypassAdminCheck` ou equivalente público;
- bootstrap possui operação específica e invariantes explícitos;
- instalação existente sem PIN tem caminho seguro de migração sem `1234`;
- criação inicial de PIN não pode ser chamada em estado arbitrário;
- `finalizarCulto()` não retorna sucesso falso;
- `currentUser` reflete corretamente a migração de permissão explícita;
- nenhuma correção já concluída do P0 foi desfeita;
- `npm run lint` passa;
- `npm run build` passa.

Ao concluir, faça um commit separado na branch `implementacao-fases` e informe objetivamente: arquivos alterados, comportamento antes/depois, validações executadas e SHA do commit. Não avance para P1/P2 nesse mesmo commit.