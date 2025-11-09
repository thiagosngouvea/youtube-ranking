# 🔐 Configuração de Autenticação

Este sistema possui autenticação para proteger funcionalidades administrativas.

## 📋 Funcionalidades Protegidas

Apenas usuários **admin** autenticados podem:
- ✏️ Adicionar novos canais
- 🔄 Atualizar dados dos canais
- 👥 Gerenciar grupos de canais
- ❌ Remover canais (se implementado)

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

Edite o arquivo `lib/auth-context.tsx`:

```typescript
const ADMIN_EMAILS = [
  'admin@example.com',        // ← Altere para seu email
  'seu-email@dominio.com',    // Adicione mais admins aqui
];
```

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

### ⚠️ IMPORTANTE: Ambiente de Desenvolvimento

O sistema atual usa proteção básica. Para **produção**, implemente:

1. **Firebase Admin SDK** para verificação de tokens
2. **Custom Claims** do Firebase para roles de usuário
3. **API Keys** em variáveis de ambiente
4. **HTTPS** obrigatório

### 📝 Melhorias para Produção

Edite `lib/auth-api.ts` para implementar verificação real:

```typescript
import admin from 'firebase-admin';

export async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;
    
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Verificar custom claims
    return decodedToken.admin === true;
  } catch (error) {
    return false;
  }
}
```

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
  ├── auth-context.tsx       # Context React de autenticação
  ├── auth-api.ts           # Verificação de admin nas APIs
  └── firebase-client.ts    # Firebase client config

app/
  ├── login/
  │   └── page.tsx          # Página de login
  ├── layout.tsx            # AuthProvider wrapper
  └── page.tsx              # Proteção de botões admin

components/
  └── AuthButton.tsx        # Botão Login/Logout
```

## 🎯 Próximos Passos

1. **Adicione seu email** à lista de admins
2. **Crie um usuário** no Firebase Console
3. **Teste o login** na aplicação
4. **Configure produção** com Firebase Admin SDK

---

💡 **Dica**: Para desenvolvimento rápido, você pode comentar temporariamente a verificação de admin nas APIs, mas **NUNCA** faça isso em produção!

