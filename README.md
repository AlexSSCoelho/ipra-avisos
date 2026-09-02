# 🏛️ IPRA Avisos — Sistema de Gestão de Comunicados e Púlpito em Tempo Real

<div align="center">

![IPRA Avisos](https://img.shields.io/badge/IPRA-Auriflama-amber?style=for-the-badge&logo=church)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor_7-Android_APK-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)

<p align="center">
  <b>Aplicativo eclesiástico desenvolvido para a IPRA (Igreja Presbiteriana Renovada de Auriflama / SP).</b><br/>
  Agilidade na anotação de visitantes, pedidos de oração, reuniões nos lares e comunicados durante o culto com transmissão em tempo real para o dirigente no púlpito.
</p>

</div>

---

## 📖 Visão Geral

O **IPRA Avisos** foi projetado para substituir anotações em papéis e mensagens dispersas durante os cultos públicos. O aplicativo conecta a equipe de recepção e os **diáconos** ao **pastor / dirigente** que conduz a reunião no altar, oferecendo uma leitura clara, sóbria, em modo teleprompter e de alto contraste.

---

## 🌟 Estrutura Operacional do App

### 1. 🏠 Início (Hub de Culto ao Vivo)
- **Status da Reunião**:
  - Exibe status do culto em tempo real com indicador pulsante `🔴 Culto em Andamento`.
  - Horário de início, nome do Dirigente do Altar e botão de encerramento seguro.
- **4 Métricas Instantâneas**:
  - Contagem ao vivo de **Visitantes**, **Pedidos de Oração**, **Reuniões nos Lares** e **Comunicados Gerais**.
- **Acesso Operacional Rápido**:
  - Botões dedicados para `Anotar Novo Aviso`, `Abrir Púlpito do Altar`, `Ver Histórico` e `Baixar APK Nativo`.
- **Modo Sem Culto Ativo**:
  - Botão de destaque `[ ＋ Iniciar Novo Culto Agora ]` para configuração rápida de tema e dirigente.

### 2. ✍️ Anotação de Avisos (Diaconia & Recepção)
- Cadastro humanizado e veloz:
  - **Visitantes**: Nome, composição (*Homem, Mulher, Casal, Família, Jovem*), cidade e igreja de origem.
  - **Pedidos de Oração**: Nome da pessoa, 7 categorias temáticas e opção de *⚡ Prioridade no Púlpito*.
  - **Reuniões & Grupos**: Oração nos lares, mocidade, varões, irmãs, datas e horários rápidos.
  - **Comunicados Gerais**: Assuntos oficiais da secretaria e liderança.

### 3. 📖 Púlpito do Altar (Teleprompter OLED)
- **Design Sóbrio de Alto Contraste**: Fundo preto puro (`#000000`), sem reflexos de iluminação do palco.
- **Tipografia Escalonável**: Controle de zoom rápido (`A-` e `A+` de 100% a 180%).
- **Confirmação com 1 Toque**: Marcação com pulso esmeralda, sinal sonoro e feedback tátil por vibração.
- **Filtros Rápidos**: Visualização de todos ou separação por categoria (Visitantes, Orações, etc.).

### 4. 📜 Histórico & Exportação WhatsApp
- Registro de todos os comunicados e visitantes da sessão.
- Botão de **Copiar Relatório Completo formatado para WhatsApp** para envio direto à secretaria ou grupo de liderança.

### 5. ⚙️ Painel Clean de Ajustes & Perfil (`SettingsModal`)
- Acesso instantâneo pelo ícone `⚙️` no cabeçalho ou menu de perfil.
- **Geral & Perfil**: Dados do obreiro conectado, logout/troca de usuário, sons, tema escuro e zoom.
- **Dirigente**: Passagem rápida da condução do culto para outro pastor/obreiro.
- **Obreiros**: Cadastro e gerenciamento do corpo ministerial.
- **Segurança**: Alteração de Senha Master de 4 dígitos.
- **Nuvem**: Integração direta com credenciais JSON do Firebase Firestore.
- **Download do APK**: Baixe o instalador oficial `.apk` diretamente para Android.

---

## 📱 Experiência de Uso (UX & Mobile)

- **👆 Transição Deslizante 60 FPS (Transactional Slide)**: Troca física suave entre abas com aceleração por hardware.
- **🖐️ Gesto de Deslizar o Dedo (Universal Swipe)**: Deslize para a esquerda ou direita a partir de qualquer ponto da tela para navegar entre as abas.
- **🛑 Contenção Perfeita de Viewport**: Eliminação completa de rolagem infinita ou espaços em branco vazios no mobile. Cada aba possui rolagem interna isolada.
- **📦 APK Nativo Android Oficial**: Pacote compilado (`ipra-avisos.apk`) de 4.5 MB pronto para instalação direta sem barras de navegador.
- **⚡ Sincronização em 0ms**: Suporte síncrono local + `BroadcastChannel` + `Firebase Firestore SDK`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Mobile Nativo**: [Capacitor 7](https://capacitorjs.com/) + Android SDK 34/36
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Persistência**: `localStorage` + `BroadcastChannel` + `Firebase Firestore SDK`
- **Áudio**: Web Audio API nativa
- **PWA**: Web App Manifest + Service Worker

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm`

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/AlexSSCoelho/ipra-avisos.git
cd ipra-avisos
npm install
```

### 2. Iniciar Ambiente de Desenvolvimento
```bash
npm run dev
```

### 3. Gerar Build de Produção
```bash
npm run build
npm run preview -- --host --port 5173
```

### 4. Compilar o APK Android Nativo
```bash
npx cap copy android
cd android
./gradlew assembleDebug
```
O APK compilado é gerado em `android/app/build/outputs/apk/debug/app-debug.apk`.

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

## 🏛️ Igreja Presbiteriana Renovada de Auriflama (IPRA)

*Auriflama - SP*  
*"Tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor." — Cl 3:23*
