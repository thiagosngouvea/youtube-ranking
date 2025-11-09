# ⚡ Início Rápido - YouTube Podcast Ranking

## 🎯 Para Ver os Dados Funcionando

Siga estes passos na ordem:

### 1️⃣ Configure as Variáveis de Ambiente (5 min)

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# YouTube API (OBRIGATÓRIO)
YOUTUBE_API_KEY=sua_chave_aqui

# Firebase Web
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2️⃣ Obtenha a YouTube API Key

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto novo
3. Vá em **"APIs e Serviços" → "Biblioteca"**
4. Procure por **"YouTube Data API v3"**
5. Clique em **"Ativar"**
6. Vá em **"Credenciais" → "+ Criar credenciais" → "Chave de API"**
7. Copie a chave e cole no `.env.local`

### 3️⃣ Configure o Firebase

1. Acesse: https://console.firebase.google.com/
2. Crie um projeto
3. Ative o **Firestore Database**
4. Configure as **regras**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

5. Obtenha as credenciais:
   - **Web**: Configurações do projeto → Seus aplicativos → Web
   - **Admin**: Configurações → Contas de serviço → Gerar chave privada

6. Cole todas as credenciais no `.env.local`

### 4️⃣ Reinicie o Servidor

```bash
# Pare o servidor (Ctrl + C)
# Depois rode novamente:
npm run dev
```

### 5️⃣ Adicione um Canal de Teste

1. Abra http://localhost:3000
2. Clique em **"Adicionar Canal"**
3. Cole um dos exemplos:
   ```
   https://www.youtube.com/@FlowPodcast
   https://www.youtube.com/@PodPah
   https://www.youtube.com/@VenusPodcast
   ```
4. Escolha a categoria
5. Clique em **"Adicionar"**

### 6️⃣ Atualize os Dados

1. Clique em **"Atualizar Dados"**
2. Aguarde ~30 segundos por canal
3. O sistema vai buscar:
   - ✅ Informações do canal
   - ✅ Vídeos dos últimos 30 dias
   - ✅ Views, likes, comentários

### 7️⃣ Veja o Ranking Trending

1. Clique em **"Trending"** (botão laranja)
2. Agora você verá os dados!
3. Alterne entre os períodos

## 🐛 Se Ainda Estiver Zerado:

### Verifique no Console do Navegador (F12):

```javascript
// Deve mostrar os vídeos salvos
await fetch('/api/ranking/period?period=30').then(r => r.json())
```

### Verifique o Terminal:

Procure por erros como:
- ❌ `403 Forbidden` → API Key inválida
- ❌ `Firebase admin initialization error` → Credenciais Firebase erradas
- ❌ `Channel not found` → ID do canal inválido

## 📊 Estrutura de Dados no Firestore:

Após "Atualizar Dados", você deve ter:

```
firestore/
├── channels/          # Informações dos canais
├── videos/            # Vídeos dos últimos 30 dias
└── channelStats/      # Histórico de estatísticas
```

## ✅ Checklist de Verificação:

- [ ] Arquivo `.env.local` criado
- [ ] `YOUTUBE_API_KEY` configurada
- [ ] YouTube Data API v3 ativada no Google Cloud
- [ ] Firebase configurado (Web + Admin)
- [ ] Servidor reiniciado após configurar `.env.local`
- [ ] Canal adicionado com sucesso
- [ ] "Atualizar Dados" executado
- [ ] Sem erros no console do navegador
- [ ] Sem erros no terminal

## 🎉 Pronto!

Agora você deve ver:
- ✅ Ranking geral com dados
- ✅ Trending com visualizações por período
- ✅ Gráficos na página individual do canal

---

**Dica**: Execute "Atualizar Dados" pelo menos 1x por dia para manter os dados atualizados!

