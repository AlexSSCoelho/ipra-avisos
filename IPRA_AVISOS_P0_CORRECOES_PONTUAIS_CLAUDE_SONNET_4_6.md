# IPRA Avisos — correções pontuais do P0 para Claude Sonnet 4.6

# Objetivo

Corrigir exclusivamente os gaps restantes identificados na revisão do commit `793317dfaaf1cf2559f104409ca61970595108a7`.

Não avance para P1/P2. Não redesenhe navegação, Home, Settings, formulários ou Púlpito além do estritamente necessário para fechar os problemas abaixo.

O foco desta tarefa é: autorização correta, bootstrap inicial seguro e consistência das regras de domínio.

# Contexto relevante

O commit P0 anterior melhorou corretamente dados demo, autoidentificação, horário do culto, métricas, swipe, escopo do relatório e parte das permissões. Entretanto, a revisão detectou bypasses e regras ainda abertas.

Arquivos prioritários para esta correção:

- `src/components/auth/LoginScreen.tsx`
- `src/context/AuthContext.tsx`
- `src/context/CultoContext.tsx`
- `src/context/AvisosContext.tsx`
- `src/services/storageService.ts`
- `src/components/configuracoes/SettingsModal.tsx`
- `src/components/diacono/MeusAvisosHoje.tsx`

Antes de editar, confirme no estado atual do repositório os contratos e usos reais dessas funções.

# Correções obrigatórias

## 1. Eliminar bypass ao assumir a direção do culto

Hoje `LoginScreen` chama algo equivalente a:

```ts
definirDirigente(selectedObreiro, pin || undefined)
```

E `CultoContext.definirDirigente()` só valida PIN quando `adminPin !== undefined`.

Consequência: marcar “Estou dirigindo o culto de hoje” e deixar o PIN vazio pode pular a validação.

### Resultado esperado

- Tentar assumir a direção do culto deve exigir autorização válida quando houver mudança real de dirigente.
- PIN vazio nunca pode significar “ignorar autorização”.
- Se o usuário selecionado já for o dirigente atual, não é necessário exigir novamente uma troca de dirigente; apenas identificar o usuário e direcioná-lo ao Púlpito.
- Se o usuário não for o dirigente atual e tentar assumir a direção, a operação deve falhar sem autorização válida.
- Não deixe essa regra apenas na UI; `definirDirigente()` deve rejeitar chamadas indevidas no contexto/domínio.

## 2. `setDirigenteDoCulto()` não pode criar culto

Hoje `storageService.setDirigenteDoCulto()` cria um novo culto automaticamente quando `getCultoAtivo()` retorna `null`.

Isso permite contornar a regra de `iniciarNovoCulto()` e criar uma sessão por um caminho alternativo.

### Resultado esperado

- `setDirigenteDoCulto()` deve apenas trocar o dirigente de um culto já existente.
- Se não houver culto, retorne falha ou não execute alteração.
- A criação de um novo culto deve acontecer somente pelo fluxo oficial `iniciarNovoCulto()`.
- Não replique lógica de criação de culto em outro ponto.

## 3. Remover o PIN padrão 1234 como fallback operacional

O seed inicial foi removido, mas `getAdminPin()` ainda retorna `1234` quando não existe PIN salvo, e a interface ainda revela “padrão: 1234”.

### Resultado esperado

- Remova qualquer texto que revele PIN padrão.
- `getAdminPin()` não deve fabricar `1234` quando não existe configuração.
- Modele explicitamente a ausência de PIN.
- `verifyAdminPin()` deve falhar quando nenhum PIN administrativo estiver configurado.
- Não introduza outro PIN fixo equivalente.

## 4. Implementar bootstrap inicial explícito

Com dados demo removidos, uma instalação nova pode ter zero obreiros e zero administrador. Atualmente o cadastro livre de obreiro pode ser usado para criar um `Pastor`, e `isAdmin` concede administração por cargo.

Isso mistura primeira configuração com cadastro comum e permite escalada de privilégio por escolha de cargo.

### Resultado esperado

Implemente um fluxo mínimo de primeira configuração, sem overengineering.

Quando não existir nenhum obreiro cadastrado:

- a tela inicial deve entrar em estado claro de “Primeira configuração”;
- o usuário cria o primeiro perfil administrativo deliberadamente;
- o fluxo deve exigir criação de um PIN administrativo antes de concluir o bootstrap;
- esse primeiro perfil deve receber privilégio administrativo explícito;
- após concluir, o comportamento normal do app começa.

Depois que já existir pelo menos um obreiro:

- cadastro de novos obreiros não pode ficar disponível livremente na tela de identificação;
- cadastro/gestão de obreiros deve exigir administrador;
- não conceda administração automaticamente apenas porque `cargo === 'pastor'`.

## 5. Tornar `isAdmin` baseado em privilégio explícito

Hoje `isAdmin` é verdadeiro quando `currentUser.isAdmin` ou quando o cargo é `pastor`/`admin`.

Isso permite privilégio administrativo implícito por cargo.

### Resultado esperado

- Administração deve depender de uma propriedade explícita de permissão (`isAdmin` ou equivalente já existente no modelo).
- Cargo eclesiástico não deve, sozinho, conceder administração.
- Preserve compatibilidade com registros existentes: se houver dados reais já persistidos em que pastores dependiam dessa inferência, implemente migração simples e previsível para não perder acesso administrativo.
- Não faça migração com base em nome, posição da lista ou heurística frágil.

## 6. Proteger cadastro de obreiros no contexto/domínio

`AuthContext.addObreiro()` hoje não valida permissão.

### Resultado esperado

- Fora do bootstrap inicial, apenas administrador pode criar obreiro.
- A UI deve esconder/desabilitar cadastro para não administradores.
- O contexto também deve rejeitar chamada indevida.
- Se a assinatura de `addObreiro()` precisar retornar `{ success, message }`, ajuste os chamadores de forma consistente.

## 7. Definir e aplicar regra para exclusão/cancelamento de aviso

`AvisosContext.excluirAviso()` ainda não possui regra de autorização.

### Regra a implementar

- autor do aviso pode cancelar/excluir o próprio aviso enquanto ele estiver `pendente`;
- dirigente ou administrador pode excluir um aviso pendente de qualquer autor, se necessário operacionalmente;
- aviso com status `anunciado` não deve ser apagado por esse fluxo comum;
- se for necessária exclusão administrativa de histórico no futuro, isso não pertence a esta tarefa.

### Resultado esperado

- valide identidade, status e permissão antes de alterar estado;
- a UI deve refletir a mesma regra;
- chamada indevida deve falhar sem modificar localStorage/Firestore.

## 8. Não deixar funções administrativas retornarem sucesso falso

Revise as funções alteradas no P0 para casos como:

- encerrar culto quando não existe culto;
- trocar dirigente quando não existe culto;
- definir dirigente inexistente/inativo;
- cadastrar usuário em estado inválido;
- cancelar aviso inexistente ou anunciado.

### Resultado esperado

Função que não executou a operação deve retornar falha clara quando o contrato usar resultado explícito. Evite `{ success: true }` em no-op inválido.

# Restrições

- Não implemente P1/P2.
- Não altere identidade visual do app.
- Não troque stack, storage ou Firebase.
- Não introduza biblioteca de autenticação, backend novo ou sistema de contas complexo.
- O app continua sendo uma ferramenta operacional interna; o objetivo é autorização coerente, não transformar o produto em plataforma enterprise de identidade.
- Preserve dados reais existentes sempre que possível.
- Mudanças de storage devem ter migração simples e segura quando necessárias.
- Não reintroduza dados demo ou credenciais padrão.
- Não esconda problema apenas na interface; regras críticas devem existir no contexto/serviço apropriado.

# Execução

1. Explore os chamadores das funções afetadas antes de editar.
2. Faça um plano curto citando os arquivos que serão alterados.
3. Corrija primeiro domínio/context/storage; depois alinhe a UI.
4. Não expanda escopo após resolver os itens listados.
5. Se encontrar uma ambiguidade de produto que altere materialmente permissões, registre-a; não invente uma política paralela.

# Validação

Execute:

```bash
npm run lint
npm run build
```

Valide manualmente pelo menos estes cenários:

1. instalação nova com zero obreiros;
2. primeira configuração cria primeiro admin + PIN;
3. app reinicia e mantém esse admin;
4. não administrador não consegue cadastrar obreiro;
5. criar obreiro com cargo Pastor não concede admin automaticamente;
6. usuário comum não consegue iniciar culto;
7. usuário comum não consegue assumir direção sem autorização;
8. PIN vazio é rejeitado ao tentar assumir direção;
9. PIN errado é rejeitado;
10. dirigente atual consegue se identificar sem trocar dirigente novamente;
11. `setDirigenteDoCulto` não cria culto quando não existe sessão;
12. admin inicia culto normalmente;
13. admin troca dirigente em culto existente;
14. dirigente/admin encerram culto; usuário comum não;
15. autor cancela o próprio aviso pendente;
16. autor não consegue excluir aviso já anunciado;
17. usuário comum não consegue excluir aviso pendente de outro autor;
18. dirigente/admin conseguem remover pendente quando permitido;
19. ausência de PIN não usa fallback `1234`;
20. nenhuma interface revela credencial padrão.

# Critério de pronto

Considere esta correção concluída somente quando:

- não existe bypass para assumir direção sem autorização;
- trocar dirigente nunca cria culto;
- não existe PIN administrativo padrão ou fallback oculto;
- primeira instalação possui bootstrap explícito e funcional;
- depois do bootstrap, cadastro de obreiros é administrativo;
- cargo eclesiástico não concede admin implicitamente;
- exclusão/cancelamento de aviso respeita autor, status e privilégio;
- funções críticas não retornam sucesso quando nada válido foi executado;
- `npm run lint` passa;
- `npm run build` passa;
- os cenários manuais acima foram conferidos.

Ao terminar, faça um commit separado apenas dessas correções P0 e informe no resumo final quais bypasses foram eliminados, quais arquivos foram alterados e quais validações foram executadas.