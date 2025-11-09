# 🔥 Configuração Firebase Authentication

## ✅ Problema Resolvido

O erro `Cannot read properties of undefined (reading 'onAuthStateChanged')` foi corrigido!

**O que foi feito:**
- ✅ Adicionado `getAuth` e exportação do `auth` no `lib/firebase-client.ts`

## 📝 Configuração do `.env.local`

Você precisa adicionar as variáveis do Firebase **Client SDK** no seu arquivo `.env.local`:

### 1. Abra ou Crie `.env.local` na raiz do projeto

### 2. Adicione as variáveis do Firebase Authentication:

```env
# YouTube Data API (você já deve ter isso)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Firebase Admin SDK (Server-side) - você já deve ter isso
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

# ⭐ Firebase Client SDK (Client-side) - ADICIONE ESTAS NOVAS VARIÁVEIS:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Onde Encontrar Essas Informações?

#### Opção 1: Firebase Console (Recomendado)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **⚙️ Configurações do Projeto** (ícone de engrenagem)
4. Role até **"Seus apps"**
5. Clique no ícone **Web** (`</>`) ou selecione seu app web existente
6. Copie os valores do objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "seu-projeto.firebaseapp.com",  // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "seu-projeto",             // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "seu-projeto.appspot.com",   // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",       // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"            // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

#### Opção 2: Usar os mesmos valores do Admin SDK

Se você já tem `FIREBASE_PROJECT_ID` configurado, pode reutilizar:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_mesmo_project_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
```

## 🔐 Ativar Authentication no Firebase

1. No [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** (menu lateral)
3. Clique em **Get Started** (se for a primeira vez)
4. Vá na aba **Sign-in method**
5. Clique em **Email/Password**
6. **Ative** o primeiro switch (Email/Password)
7. Clique em **Save**

## 👤 Criar Primeiro Usuário Admin

1. No Firebase Console → **Authentication** → **Users**
2. Clique em **Add User**
3. Email: `thiagonunes026@gmail.com` (seu email já configurado)
4. Senha: Escolha uma senha forte
5. Clique em **Add User**

## 🚀 Reiniciar o Servidor

Após configurar o `.env.local`:

```bash
# Pare o servidor (Ctrl+C)
# Reinicie:
npm run dev
```

## ✅ Testar

1. Acesse [http://localhost:3000](http://localhost:3000)
2. Clique no botão **"Admin"** no canto superior direito
3. Faça login com:
   - **Email**: `thiagonunes026@gmail.com`
   - **Senha**: A senha que você configurou
4. Após o login, você verá:
   - Badge **"Admin"** no header
   - Botão **"Adicionar Canal"**
   - Botão **"Atualizar Dados"**

## 🐛 Troubleshooting

### Erro: "auth/invalid-api-key"
❌ A variável `NEXT_PUBLIC_FIREBASE_API_KEY` está incorreta  
✅ Verifique no Firebase Console e copie novamente

### Erro: "auth/project-not-found"
❌ O `NEXT_PUBLIC_FIREBASE_PROJECT_ID` está incorreto  
✅ Confirme o Project ID no Firebase Console

### Botão Admin não funciona
❌ Variáveis não foram carregadas  
✅ Reinicie o servidor Next.js após configurar `.env.local`

### Login funciona mas botões não aparecem
❌ Email não está na lista de admins  
✅ Verifique se `thiagonunes026@gmail.com` está em `lib/auth-context.tsx` (linha 30)

## 📚 Estrutura Completa

```
.env.local                     ← Configure aqui
lib/
  ├── firebase-client.ts       ← ✅ Já configurado (exporta auth)
  ├── auth-context.tsx         ← ✅ Já configurado (seu email)
  └── auth-api.ts             ← Proteção de APIs
app/
  └── login/page.tsx          ← Página de login
```

---

**Próximo passo:** Configure seu `.env.local` e reinicie o servidor! 🚀

