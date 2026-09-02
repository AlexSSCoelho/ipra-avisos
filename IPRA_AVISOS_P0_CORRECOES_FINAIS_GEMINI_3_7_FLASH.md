# IPRA Avisos — microcorreções finais do P0 para Gemini 3.7 Flash no Antigravity

# Objetivo

Aplicar exclusivamente três microcorreções finais no P0 já implementado da branch `implementacao-fases`, cujo estado revisado atual é o commit `8da1b386794208297e00b81fad92f614b572b494`.

O executor desta especificação é **Gemini 3.7 Flash no Google Antigravity**.

Não refaça o P0, não avance para P1/P2 e não altere arquitetura, navegação, Home, formulários, Histórico ou Púlpito. O commit `8da1b386794208297e00b81fad92f614b572b494` fechou corretamente os gaps anteriores de autorização, bootstrap, migração de PIN, encerramento de culto e sincronização de `currentUser`. Preserve esse comportamento.

# Contexto relevante

O app é `AlexSSCoelho/ipra-avisos`, React + TypeScript + Vite, com Capacitor, `localStorage`/`BroadcastChannel` e Firestore opcional.

O P0 já está funcional. A revisão final encontrou apenas três pontos pequenos:

1. a migração de `isAdmin` ainda confunde propriedade ausente com `isAdmin: false`;
2. alguns textos voltaram a usar “Master” para o PIN administrativo;
3. o PIN é descrito como numérico/dígitos, mas hoje a validação exige apenas comprimento mínimo.

Arquivos prioritários:

- `src/context/AuthContext.tsx`
- `src/components/configuracoes/SettingsModal.tsx`
- `src/components/auth/AdminPassModal.tsx`
- qualquer outro arquivo que contenha os mesmos textos ou validações de PIN, somente se necessário para consistência

Antes de editar, confirme o estado real desses arquivos no HEAD da branch.

# Estado já concluído e que não deve ser alterado

- [x] dados demo removidos;
- [x] bootstrap inicial explícito;
- [x] `isAdmin` é privilégio explícito para novos registros;
- [x] `bootstrapInitialAdmin()` substituiu bypass público;
- [x] dirigente atual entra sem redigitar PIN;
- [x] troca real de dirigente continua protegida;
- [x] instalação existente sem PIN possui fluxo de migração;
- [x] `finalizarCulto()` falha corretamente sem culto em andamento;
- [x] `currentUser` é sincronizado após migração;
- [x] fallback `1234` foi removido;
- [x] `setDirigenteDoCulto()` não cria culto;
- [x] regras de cancelamento/exclusão de aviso continuam protegidas.

# Correções obrigatórias

## 1. Migrar para admin somente quando `isAdmin` estiver ausente

A migração de compatibilidade atual usa condição equivalente a:

```ts
!o.isAdmin && (o.cargo === 'pastor' || o.cargo === 'admin')
```

Isso trata estes dois estados como iguais:

```ts
isAdmin === undefined
isAdmin === false
```

Consequência: um Pastor/Admin que tenha sido explicitamente configurado como `isAdmin: false` pode voltar a receber administração ao executar a migração.

### Resultado esperado

A migração de compatibilidade deve atingir somente registros legados em que a propriedade realmente não existe.

Use uma verificação semanticamente equivalente a:

```ts
o.isAdmin === undefined
```

ou uma checagem explícita de presença da propriedade, se for mais apropriada ao tipo atual.

Comportamento obrigatório:

- registro legado `Pastor` sem campo `isAdmin` → pode migrar para `isAdmin: true` para preservar acesso anterior;
- registro legado `admin` sem campo `isAdmin` → pode migrar para `isAdmin: true`;
- `Pastor` com `isAdmin: false` → permanece `false`;
- qualquer novo Pastor/obreiro com `isAdmin: false` → permanece `false`;
- cargo, sozinho, não deve voltar a conceder administração após essa migração.

Preserve a sincronização já implementada de `currentUser` com o registro migrado.

## 2. Padronizar a linguagem para “PIN administrativo”

A revisão do commit `8da1b386...` encontrou textos como “PIN Master” / “PIN master” na área de Segurança, apesar de o restante do P0 já usar linguagem administrativa explícita.

### Resultado esperado

Padronize a interface para:

- `PIN administrativo`;
- `senha administrativa`, quando o texto estiver se referindo à autorização pelo PIN.

Evite:

- `Master`;
- `PIN Master`;
- `Senha Master`.

Não altere nomes internos de variáveis apenas por estética se isso não trouxer ganho real. O foco é linguagem apresentada ao usuário.

## 3. Garantir que PIN seja realmente numérico

A UI usa `inputMode="numeric"` e mensagens como “mínimo 4 dígitos”, mas o domínio atualmente valida principalmente o comprimento da string. `inputMode` não impede caracteres não numéricos.

### Resultado esperado

A política do PIN administrativo deve ser consistente em todos os fluxos de criação e alteração:

- somente dígitos `0-9`;
- mínimo de 4 dígitos;
- PIN vazio é inválido;
- caracteres, espaços, sinais e letras são inválidos;
- confirmação do PIN continua exigindo igualdade entre os valores.

Implemente a validação em nível reutilizável/domínio quando possível, em vez de depender apenas do atributo visual do input.

Uma regra equivalente a esta é adequada:

```ts
/^\d{4,}$/
```

Aplique de forma coerente em:

- bootstrap inicial;
- configuração do primeiro PIN em instalação migrada;
- alteração do PIN administrativo.

A UI deve exibir mensagem clara quando o valor não for um PIN numérico válido.

# Escopo e restrições

- Não avance para P1/P2.
- Não modifique fluxos já aprovados do P0.
- Não altere política de quem é administrador além da correção específica da migração `undefined` versus `false`.
- Não reintroduza inferência permanente de admin por cargo.
- Não altere bootstrap, troca de dirigente, encerramento de culto ou exclusão de avisos além do necessário para manter compatibilidade.
- Não introduza dependências ou abstrações novas para três correções simples.
- Não faça redesign.

# Validação

Execute obrigatoriamente:

```bash
npm run lint
npm run build
```

Valide também estes cenários:

1. Pastor legado sem propriedade `isAdmin` migra para administrador conforme a compatibilidade atual;
2. Pastor com `isAdmin: false` continua não administrador após recarga/migração;
3. novo Pastor com `isAdmin: false` não recebe administração automaticamente;
4. `currentUser` continua sincronizado quando uma migração legítima ocorre;
5. não existe mais texto visível “Master”, “PIN Master” ou “Senha Master” relacionado ao PIN;
6. PIN `1234` é aceito quando criado normalmente, sem qualquer significado especial de padrão;
7. PIN `123` é rejeitado;
8. PIN `12a4` é rejeitado;
9. PIN `12 34` é rejeitado;
10. PIN `abcd` é rejeitado;
11. bootstrap aplica a mesma regra numérica;
12. migração de primeiro PIN aplica a mesma regra numérica;
13. alteração de PIN aplica a mesma regra numérica;
14. as correções anteriores do P0 continuam funcionando.

# Critério de pronto

Considere esta microcorreção concluída somente quando:

- migração distingue `isAdmin === undefined` de `isAdmin === false`;
- `isAdmin: false` nunca é sobrescrito apenas por cargo;
- linguagem visível usa “PIN administrativo”/“senha administrativa” em vez de “Master”;
- PIN administrativo aceita apenas dígitos e mínimo de 4 caracteres numéricos em todos os fluxos de criação/alteração;
- nenhuma correção anterior do P0 foi desfeita;
- `npm run lint` passa;
- `npm run build` passa.

Ao concluir, faça um commit separado na branch `implementacao-fases` contendo somente essas microcorreções e informe arquivos alterados, validações executadas e SHA do commit. Não avance para P1/P2 no mesmo commit.
