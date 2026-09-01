# 🏛️ IPRA Avisos — Sistema de Gestão de Comunicados e Púlpito em Tempo Real

<div align="center">

![IPRA Avisos](https://img.shields.io/badge/IPRA-Auriflama-amber?style=for-the-badge&logo=church)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)

<p align="center">
  <b>Aplicativo eclesiástico desenvolvido para a IPRA (Igreja Presbiteriana Renovada de Auriflama / SP).</b><br/>
  Agilidade na anotação de visitantes, pedidos de oração, reuniões nos lares e comunicados durante o culto com transmissão em tempo real para o dirigente no púlpito.
</p>

</div>

---

## 📖 Visão Geral

O **IPRA Avisos** foi projetado para substituir anotações em papéis e mensagens dispersas durante os cultos públicos. O aplicativo conecta os **diáconos** (que recepcionam visitantes e anotam intercessões) ao **pastor / dirigente** que conduz a reunião no altar, oferecendo uma leitura clara, sóbria, em modo teleprompter e de alto contraste.

---

## 👥 Perfis de Acesso & Funcionalidades

O sistema conta com **3 níveis de acesso estritos**, adaptando a interface conforme o perfil do obreiro:

### 1. ✍️ Usuário Comum (Diácono / Diaconisa / Obreiro Anotador)
- **Anotação de Avisos**: Cadastro rápido com interface humanizada:
  - **Visitantes**: Nome livre, composição (*Homem, Mulher, Casal, Família, Jovem*), cidade livre, igreja de origem livre e observações.
  - **Pedidos de Oração**: Nome da pessoa, 7 categorias temáticas e opção de *⚡ Prioridade no Púlpito*.
  - **Reuniões & Grupos**: Oração nos lares, grupos de mocidade, varões, irmãs, datas e horários rápidos.
  - **Comunicados Gerais**: Assuntos oficiais da secretaria e liderança.
- **Registros do Culto**: Timeline para acompanhar em tempo real se o aviso já foi lido pelo pastor (`⏳ No Púlpito` vs `✓ Anunciado`).
- **Interface Limpa**: O diácono **não visualiza** menus técnicos nem telas de púlpito.

### 2. 👑 Dirigente do Culto (Pastor / Obreiro no Altar)
- **Púlpito (Teleprompter OLED)**:
  - Fundo preto puro (`#000000`) de alto contraste, sem reflexos de iluminação.
  - Tipografia de alta legibilidade com **zoom de acessibilidade** (`[ A- ]` `100% a 180%` `[ A+ ]`).
  - Faixas e badges coloridos por categoria.
  - **Confirmação com 1 Toque**: Ao marcar como anunciado, o cartão emite feedback verde esmeralda com pulso luminoso, sino sonoro via Web Audio API e vibração tátil no aparelho celular.
  - Opção de restauração de avisos lidos.
- **Passar Direção do Culto**: Pode transferir a condução do púlpito para outro obreiro a qualquer momento.
- **Concluir Culto de Hoje**: Encerramento seguro da sessão.

### 3. 🛡️ Administrador Master (Pastor Presidente / Secretaria)
- Acesso irrestrito a todas as áreas (**Anotação**, **Púlpito**, **Histórico** e **Ajustes Master ⚙️**).
- **Área Exclusiva Master**:
  - **Definir Dirigente do Culto**: Selecionar diretamente quem está dirigindo sem necessidade de senha.
  - **Quadro de Obreiros**: Cadastrar e gerenciar membros do corpo ministerial.
  - **Senha do Sistema**: Alterar a senha mestra/PIN de liberação.
  - **Nuvem & Credenciais Firestore**: Acesso exclusivo à configuração das chaves de banco de dados na nuvem.

---

## 📱 Recursos de Experiência & Usabilidade (UX)

- **👆 Navegação por Gestos (Swipe)**: Deslize o dedo para a esquerda ou direita na tela para alternar entre as abas, com feedback háptico (vibração nativa).
- **📲 PWA / WebAPK Nativo**: Botão de instalação com 1 toque direto no Android, funcionando em tela cheia com ícone próprio e suporte offline.
- **⚡ Sincronização Híbrida em 0ms**:
  - Barramento local síncrono para atualizações em tempo real instantâneas.
  - `BroadcastChannel` para sincronização entre múltiplas abas abertas.
  - Conector nativo com **Firebase Firestore** para sincronização entre múltiplos celulares pela internet.
- **🔊 Web Audio Feedback**: Efeitos sonoros gerados por síntese de áudio nativa via código (sem dependência de arquivos externos de áudio).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Persistência**: `localStorage` + `BroadcastChannel` + `Firebase Firestore SDK`
- **Áudio**: Web Audio API nativa
- **PWA**: Web App Manifest + Service Worker

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm` ou `yarn` ou `pnpm`

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/AlexSSCoelho/ipra-avisos.git
cd ipra-avisos
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Para gerar a build de produção:
```bash
npm run build
npm run preview
```

---

## ☁️ Configuração Opcional do Firebase Firestore

O aplicativo funciona **100% offline e localmente por padrão**. Caso queira sincronizar múltiplos aparelhos conectados à internet:

1. Crie um projeto no [Google Firebase Console](https://console.firebase.google.com/).
2. Ative o **Cloud Firestore Database**.
3. Obtenha as credenciais do seu Web App no Firebase.
4. Você pode configurar de duas formas:
   - **Pelo próprio App**: Faça login como **Admin Master**, acesse **Ajustes ⚙️ > Nuvem** e cole o JSON das credenciais.
   - **Por variáveis de ambiente**: Copie o arquivo `.env.example` para `.env` e preencha as chaves:
     ```env
     VITE_FIREBASE_API_KEY=sua_api_key
     VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=seu_projeto_id
     VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
     VITE_FIREBASE_APP_ID=seu_app_id
     ```

---

## 📋 Regras de Segurança do Firestore (Recomendado)

No Firebase Console, configure as regras de segurança do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /avisos/{avisoId} {
      allow read, write: if true;
    }
    match /cultos/{cultoId} {
      allow read, write: if true;
    }
  }
}
```

---

## 🏛️ Igreja Presbiteriana Renovada de Auriflama (IPRA)

*Auriflama - SP*  
*"Tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor." — Cl 3:23*
