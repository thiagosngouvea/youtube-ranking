# 🔐 Configuração de Autenticação

Este sistema possui autenticação completa com Firebase Auth para proteger funcionalidades administrativas.

## 📋 Funcionalidades Protegidas

Apenas usuários **admin** autenticados podem:
- ✏️ Adicionar novos canais
- 🔄 Atualizar dados dos canais (geral e individual)
- 👥 Gerenciar grupos de canais (adicionar/remover canais secundários)
- ❌ Remover canais secundários de grupos

## 🚀 Configuração Rápida

### 1. Configurar Firebase Authentication

1. No [Firebase Console](https://console.firebase.google.com/):
   - Vá em **Authentication** → **Sign-in method**
   - Ative **Email/Password**

2. Crie um usuário admin:
   - Vá em **Authentication** → **Users**
   - Clique em **Add User**
   - Adicione email e senha (ex: `admin@example.com`)

### 2. Configurar Emails Admin

Edite os arquivos de configuração (em ambos os lugares):

**Frontend** - `lib/auth-context.tsx` (linha 30):
```typescript
const ADMIN_EMAILS = [
  'thiagonunes026@gmail.com', // ← Seu email já configurado
  'outro-admin@dominio.com',  // Adicione mais admins aqui
];
```

**Backend** - `lib/auth-api.ts` (linha 6):
```typescript
const ADMIN_EMAILS = [
  'thiagonunes026@gmail.com', // ← Seu email já configurado
  'outro-admin@dominio.com',  // Adicione mais admins aqui
];
```

⚠️ **IMPORTANTE**: Adicione o email em **ambos** os arquivos!

### 3. Testar o Sistema

1. **Acesse a página principal**: [http://localhost:3000](http://localhost:3000)
   - Você verá o botão **"Admin"** no canto superior direito

2. **Faça login**:
   - Clique em **"Admin"**
   - Entre com email e senha configurados
   - Após o login, os botões administrativos aparecerão

3. **Funcionalidades disponíveis após login**:
   - ✅ Botão "Adicionar Canal"
   - ✅ Botão "Atualizar Dados"
   - ✅ Botão "Gerenciar Grupo" (nas páginas de canais principais)

## 🛡️ Segurança

### ✅ Sistema de Segurança Implementado

O sistema usa **Firebase Admin SDK** para verificação de tokens JWT em todas as rotas protegidas:

- ✅ Verificação de token JWT usando Firebase Admin SDK
- ✅ Lista de emails de administradores configurável
- ✅ Proteção em todas as rotas de API administrativas
- ✅ Token enviado automaticamente em todas as requisições autenticadas

### 🔐 Como Funciona

1. **Frontend**: Usuário faz login → Firebase Auth gera um token JWT
2. **Requisição**: Token é automaticamente adicionado no header `Authorization: Bearer <token>`
3. **Backend**: Firebase Admin SDK verifica o token e valida o email contra a lista de admins
4. **Resposta**: Se válido, executa a ação. Se inválido, retorna erro 401

### 📝 Melhorias Recomendadas para Produção

Para ambientes de produção, considere implementar:

1. **Custom Claims** do Firebase para roles de usuário
2. **HTTPS** obrigatório (já necessário pelo Firebase Auth)
3. **Rate Limiting** nas rotas de API
4. **Logs de auditoria** para ações administrativas
5. **Lista de admins em banco de dados** ao invés de hardcoded

## 🔑 Gerenciamento de Usuários

### Adicionar novo admin:

1. **Firebase Console** → **Authentication** → **Users**
2. Clique em **Add User**
3. Adicione o email à lista `ADMIN_EMAILS` no código

### Remover admin:

1. Remova o email da lista `ADMIN_EMAILS`
2. (Opcional) Desabilite o usuário no Firebase Console

## 🐛 Troubleshooting

### Problema: "Não consigo fazer login"
- ✅ Verifique se o Firebase Authentication está configurado
- ✅ Confirme que o email/senha estão corretos
- ✅ Veja o console do navegador para erros

### Problema: "Login funciona mas botões não aparecem"
- ✅ Verifique se o email está na lista `ADMIN_EMAILS`
- ✅ Faça logout e login novamente
- ✅ Limpe o cache do navegador

### Problema: "API retorna 401 Unauthorized"
- ✅ Verifique se está logado como admin
- ✅ Recarregue a página após fazer login
- ✅ Em produção, implemente verificação de token

## 📖 Estrutura do Sistema

```
lib/
  ├── firebase.ts           # Firebase Admin SDK (server) + adminAuth
  ├── firebase-client.ts    # Firebase Client SDK + auth
  ├── auth-context.tsx      # Context React de autenticação
  ├── auth-api.ts           # Verificação de admin com JWT
  └── use-auth-axios.ts     # Hook para requisições autenticadas

app/
  ├── login/
  │   └── page.tsx                    # Página de login
  ├── channel/[channelId]/
  │   └── page.tsx                    # ✅ Protegido (Atualizar Canal + Gerenciar Grupo)
  ├── api/
  │   ├── channels/
  │   │   ├── add/route.ts            # ✅ Protegido
  │   │   ├── update/route.ts         # ✅ Protegido
  │   │   └── group/
  │   │       ├── add/route.ts        # ✅ Protegido
  │   │       └── remove/route.ts     # ✅ Protegido
  ├── layout.tsx                      # AuthProvider wrapper
  └── page.tsx                        # ✅ Protegido (Adicionar + Atualizar)

components/
  ├── AuthButton.tsx        # Botão Login/Logout
  └── ChannelGroupManager.tsx  # Gerenciador de grupos
```

## 🎯 Próximos Passos

1. **Adicione seu email** à lista de admins
2. **Crie um usuário** no Firebase Console
3. **Teste o login** na aplicação
4. **Configure produção** com Firebase Admin SDK

---

💡 **Dica**: Para desenvolvimento rápido, você pode comentar temporariamente a verificação de admin nas APIs, mas **NUNCA** faça isso em produção!

