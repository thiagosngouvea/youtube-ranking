# 📊 YouTube Podcast Ranking

Um site completo para monitorar e ranquear podcasts do YouTube, com análise de métricas, gráficos de desempenho e comparativos.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## 🚀 Funcionalidades

- **Monitoramento Automático**: Coleta dados de canais do YouTube via API oficial
- **Ranking Dinâmico**: Classifica podcasts por views, inscritos e engajamento
- **Gráficos de Desempenho**: Visualize a evolução dos canais ao longo do tempo
- **Filtros por Categoria**: Humor, Entrevistas, Política, Negócios, etc.
- **Exportação de Dados**: Exporte rankings em CSV ou PDF
- **Análise de Métricas**: Views totais, likes, comentários e frequência de postagem
- **Interface Moderna**: Design responsivo com modo escuro

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Firebase/Firestore** - Banco de dados NoSQL
- **YouTube Data API v3** - Coleta de dados
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos interativos
- **Lucide React** - Ícones modernos

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Conta Firebase** (gratuita)
3. **YouTube Data API Key** (gratuita)

## 🔧 Configuração

### 1. Clone o Repositório

```bash
cd youtube-podcast-rank
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Firebase

#### 3.1. Crie um projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga o assistente de criação

#### 3.2. Configure o Firestore

1. No console do Firebase, vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção
4. Selecione a localização mais próxima

#### 3.3. Configure as regras do Firestore

No console do Firebase, vá em **Firestore Database > Regras** e adicione:

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

#### 3.4. Obtenha as credenciais

**Para o Client-side (Web):**
1. Vá em **Configurações do Projeto** (ícone de engrenagem)
2. Em "Seus aplicativos", clique no ícone `</>`
3. Registre o app e copie as configurações

**Para o Server-side (Admin):**
1. Vá em **Configurações do Projeto > Contas de serviço**
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON

### 4. Configure a YouTube Data API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**:
   - Vá em "APIs e Serviços > Biblioteca"
   - Procure por "YouTube Data API v3"
   - Clique em "Ativar"
4. Crie credenciais:
   - Vá em "APIs e Serviços > Credenciais"
   - Clique em "Criar credenciais > Chave de API"
   - Copie a chave gerada

### 5. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# YouTube Data API v3
YOUTUBE_API_KEY=sua_chave_api_youtube

# Firebase Config (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=seu-email@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua_Chave_Privada_Aqui\n-----END PRIVATE KEY-----\n"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Importante**: Para a `FIREBASE_PRIVATE_KEY`, copie o valor do campo `private_key` do arquivo JSON baixado, mantendo as quebras de linha como `\n`.

### 6. Execute o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📱 Como Usar

### Adicionando Canais

1. Clique no botão "Adicionar Canal"
2. Insira o ID do canal do YouTube
   - Você encontra na URL: `youtube.com/channel/UCxxx...` ou `youtube.com/@nome_do_canal`
   - Para canais com `@`, acesse o canal e copie o ID da URL
3. Selecione a categoria
4. Clique em "Adicionar"

### Atualizando Dados

- Clique em "Atualizar Dados" para buscar as métricas mais recentes
- A atualização pode levar alguns minutos dependendo do número de canais
- O sistema coleta automaticamente:
  - Informações do canal (nome, descrição, thumbnail)
  - Estatísticas gerais (views, inscritos, total de vídeos)
  - Vídeos dos últimos 30 dias
  - Métricas de engajamento (likes, comentários)

### Filtrando e Exportando

- Use o filtro de categoria para visualizar rankings específicos
- Clique em "Exportar CSV" para baixar os dados
- Use "Imprimir" para gerar um PDF do ranking

## 📊 Estrutura do Projeto

```
youtube-podcast-rank/
├── app/
│   ├── api/
│   │   ├── channels/
│   │   │   ├── route.ts          # Lista canais
│   │   │   ├── add/route.ts      # Adiciona canal
│   │   │   └── update/route.ts   # Atualiza dados
│   │   └── stats/
│   │       └── [channelId]/route.ts  # Estatísticas por canal
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Página principal
├── components/
│   ├── RankingTable.tsx          # Tabela de ranking
│   ├── StatsChart.tsx            # Gráficos
│   ├── AddChannelModal.tsx       # Modal para adicionar canal
│   └── ExportButtons.tsx         # Botões de exportação
├── lib/
│   ├── firebase.ts               # Config Firebase Admin
│   ├── firebase-client.ts        # Config Firebase Client
│   ├── db.ts                     # Operações de banco
│   ├── youtube.ts                # YouTube API
│   └── utils.ts                  # Funções auxiliares
├── .env.local                    # Variáveis de ambiente
├── package.json
└── README.md
```

## 🔄 Automação

Para automatizar a coleta de dados, você pode:

### Opção 1: Cron Job (Vercel)

Se hospedar na Vercel, use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs):

```typescript
// app/api/cron/update/route.ts
export async function GET() {
  // Atualiza todos os canais
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/channels/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  
  return Response.json({ success: true });
}
```

### Opção 2: Firebase Functions

Configure uma Cloud Function para executar diariamente:

```typescript
import * as functions from 'firebase-functions';

export const updateChannels = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Chame sua API de atualização
  });
```

### Opção 3: GitHub Actions

Crie um workflow que executa diariamente:

```yaml
name: Update YouTube Data
on:
  schedule:
    - cron: '0 0 * * *'  # Diariamente à meia-noite
  workflow_dispatch:
```

## 📈 Limites da API

A YouTube Data API tem um limite de **10.000 unidades/dia** (gratuito).

Custos aproximados por operação:
- `channels.list`: 1 unidade
- `videos.list`: 1 unidade
- `playlistItems.list`: 1 unidade

Para 10 canais com 50 vídeos cada = ~510 unidades por atualização completa.

## 🎨 Personalização

### Adicionar Novas Categorias

Edite `lib/utils.ts`:

```typescript
export const CATEGORIES = [
  // ... categorias existentes
  { value: 'sua-categoria', label: 'Sua Categoria' },
];
```

### Alterar Cores do Tema

Edite `tailwind.config.ts` para personalizar as cores.

## 🐛 Solução de Problemas

### Erro: "Firebase admin initialization error"
- Verifique se as variáveis de ambiente do Firebase estão corretas
- Certifique-se de que a `FIREBASE_PRIVATE_KEY` está com as quebras de linha corretas

### Erro: "YouTube API quota exceeded"
- Você excedeu o limite diário de 10.000 unidades
- Aguarde até o próximo dia ou solicite aumento de cota

### Erro: "Channel not found"
- Verifique se o ID do canal está correto
- Alguns canais privados não podem ser acessados pela API

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique a documentação do [Next.js](https://nextjs.org/docs)
2. Consulte a [YouTube Data API Docs](https://developers.google.com/youtube/v3)
3. Acesse a [Firebase Documentation](https://firebase.google.com/docs)

---

Desenvolvido com ❤️ usando Next.js e Firebase
