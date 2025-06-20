# Aplicativo Céus Abertos Caju - React Native

## Descrição
Aplicativo móvel desenvolvido em React Native com Expo para a igreja Céus Abertos Caju (Assembleia de Deus). O app inclui sistema de autenticação, agenda pastoral, eventos, cultos, cursos e painel administrativo.

## Funcionalidades Implementadas

### ✅ Autenticação
- Login via Google OAuth (Firebase Authentication)
- Controle de acesso baseado em roles (user/admin)
- Criação automática de usuários no Firestore

### ✅ Tela de Login
- Design fiel à imagem fornecida
- Layout responsivo com gradiente escuro
- Logo da igreja "CA" (Céus Abertos)
- Campos de email e senha
- Botão de login com Google
- Link "Esqueceu a senha?"

### ✅ Tela Home
- Design baseado na imagem fornecida
- Carrossel de banners com autoplay (5 segundos)
- Botões de navegação coloridos:
  - Rosa: Agenda
  - Verde: Eventos
  - Amarelo: Cultos
  - Roxo: Cursos
- Rodapé com links para redes sociais
- Indicador de transmissão ao vivo
- Acesso ao Painel de Controle (apenas admins)

### ✅ Sistema de Agenda
- Calendário interativo para agendamento pastoral
- Seleção de data e horário
- Bloqueio de horários já ocupados
- Formulário com observações
- Notificação para administradores

### ✅ Eventos e Cultos
- Visualização de eventos e cultos programados
- Cards com imagem, título, descrição e detalhes
- Filtros por data e tipo
- CRUD completo no painel admin

### ✅ Sistema de Cursos
- Lista de cursos disponíveis
- Formulário "Tenho Interesse"
- Coleta de nome e telefone
- Integração preparada para Google Drive API

### ✅ Painel de Controle (Admin)
- Gerenciamento de banners
- Gerenciamento de eventos e cultos
- Visualização e liberação de agendamentos
- Interface intuitiva com abas
- CRUD completo para todos os conteúdos

## Tecnologias Utilizadas

- **React Native** com Expo
- **Firebase** (Authentication, Firestore, Storage)
- **React Navigation** para navegação
- **Expo Linear Gradient** para gradientes
- **React Native Swiper** para carrossel
- **React Native Calendars** para agenda
- **Expo Vector Icons** para ícones

## Estrutura do Projeto

```
CeusAbertosCaju/
├── App.js                      # Arquivo principal com navegação
├── firebaseConfig.js           # Configuração do Firebase
├── screens/
│   ├── LoginScreen.js          # Tela de login
│   ├── HomeScreen.js           # Tela principal
│   ├── AgendaScreen.js         # Sistema de agendamento
│   ├── EventosScreen.js        # Lista de eventos
│   ├── CultosScreen.js         # Lista de cultos
│   ├── CursosScreen.js         # Lista de cursos
│   └── AdminPanelScreen.js     # Painel administrativo
├── components/
│   ├── BannerCarousel.js       # Componente de carrossel
│   └── CustomButton.js         # Botão customizado
└── utils/                      # Utilitários (futuras implementações)
```

## Configuração e Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Conta no Firebase
- Conta no Google Cloud Console (para Google Sign-In)

### Passos de Instalação

1. **Clone o projeto:**
   ```bash
   cd CeusAbertosCaju
   npm install
   ```

2. **Configure o Firebase:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication (Google Provider)
   - Crie um banco Firestore
   - Configure Storage
   - Substitua as credenciais em `firebaseConfig.js`

3. **Configure Google Sign-In:**
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie credenciais OAuth 2.0
   - Configure o Web Client ID em `LoginScreen.js`

4. **Execute o projeto:**
   ```bash
   npm run web          # Para web
   npm run android      # Para Android
   npm run ios          # Para iOS (requer macOS)
   ```

## Configuração do Firebase

### Firestore Collections

O aplicativo utiliza as seguintes coleções no Firestore:

#### `users`
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: "user" | "admin",
  createdAt: string
}
```

#### `banners`
```javascript
{
  title: string,
  imageUrl: string,
  active: boolean,
  createdAt: string
}
```

#### `eventos`
```javascript
{
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  imageUrl: string,
  active: boolean,
  createdAt: string
}
```

#### `cultos`
```javascript
{
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  type: string,
  imageUrl: string,
  active: boolean,
  createdAt: string
}
```

#### `cursos`
```javascript
{
  title: string,
  description: string,
  duration: string,
  schedule: string,
  instructor: string,
  price: string,
  imageUrl: string,
  active: boolean,
  createdAt: string
}
```

#### `appointments`
```javascript
{
  date: string,
  time: string,
  userId: string,
  userName: string,
  userEmail: string,
  note: string,
  status: string,
  createdAt: string
}
```

#### `settings`
```javascript
{
  // Documento 'live'
  isLive: boolean
}
```

### Regras de Segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Todos podem ler banners, eventos, cultos e cursos ativos
    match /{collection}/{document} {
      allow read: if collection in ['banners', 'eventos', 'cultos', 'cursos'] 
                  && resource.data.active == true;
    }
    
    // Apenas admins podem escrever em banners, eventos, cultos e cursos
    match /{collection}/{document} {
      allow write: if collection in ['banners', 'eventos', 'cultos', 'cursos']
                   && request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Agendamentos
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Configurações
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Google Drive API (Futuro)

Para implementar o envio de formulários de interesse em cursos para o Google Drive:

1. **Configure a API:**
   - Ative a Google Drive API no Google Cloud Console
   - Crie credenciais de serviço
   - Compartilhe uma pasta do Drive com o email de serviço

2. **Implemente o envio:**
   ```javascript
   // utils/DriveAPI.js
   import { GoogleAuth } from 'google-auth-library';
   import { google } from 'googleapis';
   
   const auth = new GoogleAuth({
     keyFile: 'path/to/service-account-key.json',
     scopes: ['https://www.googleapis.com/auth/drive.file'],
   });
   
   const drive = google.drive({ version: 'v3', auth });
   
   export const uploadToGoogleDrive = async (data) => {
     // Implementar upload de arquivo CSV/JSON para o Drive
   };
   ```

## Deploy

### Web (Netlify/Vercel)
```bash
npm run build:web
# Deploy da pasta web-build
```

### Mobile (Expo Application Services)
```bash
expo build:android
expo build:ios
```

### Stores
- **Google Play Store:** Seguir processo de publicação do Google
- **Apple App Store:** Seguir processo de publicação da Apple

## Próximos Passos

1. **Implementar Google Drive API** para formulários de cursos
2. **Adicionar notificações push** com Firebase Cloud Messaging
3. **Implementar upload de imagens** para banners e eventos
4. **Adicionar sistema de comentários** em eventos
5. **Criar dashboard de analytics** para administradores
6. **Implementar cache offline** com AsyncStorage
7. **Adicionar testes unitários** com Jest
8. **Configurar CI/CD** com GitHub Actions

## Suporte

Para dúvidas ou problemas:
- Verifique a documentação do [Expo](https://docs.expo.dev/)
- Consulte a documentação do [Firebase](https://firebase.google.com/docs)
- Revise os logs do Metro Bundler para erros de desenvolvimento

## Licença

Este projeto foi desenvolvido especificamente para a igreja Céus Abertos Caju (Assembleia de Deus).

---

**Desenvolvido com ❤️ para a comunidade Céus Abertos Caju**

