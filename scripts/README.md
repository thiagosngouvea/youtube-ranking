# Scripts de Migração e Manutenção

## 📦 Migração de Categorias

### O que faz?

O script `migrate-categories.ts` atualiza todas as categorias de canais do sistema antigo para o novo:

**Categorias Antigas → Novas:**
- `general` / `geral` → `principal`
- `entrevistas` → `principal`
- `humor` → `outros`
- `politica` → `outros`
- `negocios` → `outros`
- `esportes` → `outros`
- `tecnologia` → `outros`
- `educacao` → `outros`
- `entretenimento` → `outros`

**Categorias finais:**
- 📌 **Principal** - Canal principal com conteúdo completo
- ✂️ **Cortes** - Canal de cortes/highlights
- 📦 **Outros** - Outros tipos de canais

### Como executar

#### 1. Instalar dependências (se necessário)

```bash
npm install
```

#### 2. Garantir que o arquivo `.env.local` está configurado

Certifique-se de que seu arquivo `.env.local` contém as credenciais do Firebase:

```env
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_CLIENT_EMAIL=seu-client-email
FIREBASE_PRIVATE_KEY="sua-private-key"
YOUTUBE_API_KEY=sua-api-key
```

#### 3. Executar o script

```bash
npm run migrate-categories
```

Ou diretamente:

```bash
npx ts-node scripts/migrate-categories.ts
```

### Saída esperada

```
✅ Firebase Admin inicializado com sucesso
🔄 Iniciando migração de categorias...

📊 Encontrados 5 canais para processar

  📝 Canal: Flow Podcast
     Categoria antiga: "general" → Nova: "principal"
  📝 Canal: Flow Cortes
     Categoria antiga: "humor" → Nova: "outros"
  ...

⏳ Atualizando 3 canal(is)...
✅ Atualização concluída!

==================================================
📊 RESUMO DA MIGRAÇÃO
==================================================
Total de canais: 5
✅ Atualizados: 3
✓  Já estavam corretos: 2
==================================================

✨ Migração concluída com sucesso!

👋 Finalizando...
```

### Segurança

- ✅ O script **NÃO deleta** nenhum dado
- ✅ Apenas **atualiza** o campo `category` dos documentos
- ✅ Atualiza também o campo `updatedAt` para rastreabilidade
- ✅ Pode ser executado múltiplas vezes sem problemas (idempotente)

### Troubleshooting

#### Erro: Firebase Admin não inicializa

```
❌ Erro ao inicializar Firebase Admin
```

**Solução:** Verifique se as credenciais do Firebase no `.env.local` estão corretas.

#### Erro: Permissão negada

```
❌ Error: Missing or insufficient permissions
```

**Solução:** Certifique-se de que a conta de serviço do Firebase tem permissões de leitura/escrita no Firestore.

## 🔧 Outros Scripts

### init-firestore.ts

Inicializa o Firestore com coleções e índices necessários.

```bash
npm run init-firestore
```

## 📝 Notas

- Sempre faça backup do banco de dados antes de executar scripts de migração
- Execute primeiro em ambiente de desenvolvimento/teste
- Os scripts usam Firebase Admin SDK com permissões completas
- Logs detalhados são fornecidos para auditoria

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs do script
2. Confirme que o Firebase está acessível
3. Verifique as credenciais do `.env.local`
4. Teste a conexão com o Firestore manualmente

