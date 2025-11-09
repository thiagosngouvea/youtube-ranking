# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o YouTube Podcast Ranking! Este guia vai te ajudar a começar.

## 📋 Como Contribuir

### 1. Reportar Bugs

Encontrou um bug? Ajude-nos a melhorar!

**Antes de reportar:**
- ✅ Verifique se já não foi reportado
- ✅ Teste na última versão
- ✅ Veja o TROUBLESHOOTING.md

**Ao reportar, inclua:**
- 📝 Descrição clara do problema
- 🔄 Passos para reproduzir
- 💻 Ambiente (OS, Node version, navegador)
- 📸 Screenshots (se aplicável)
- 📋 Logs de erro do console

### 2. Sugerir Funcionalidades

Tem uma ideia? Queremos ouvir!

**Inclua:**
- 🎯 Problema que a feature resolve
- 💡 Solução proposta
- 🎨 Mockups ou exemplos (opcional)
- 🔗 Exemplos de implementações similares

### 3. Contribuir com Código

#### Setup do Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/youtube-podcast-rank.git
cd youtube-podcast-rank

# Instale dependências
npm install

# Configure .env.local (veja SETUP.md)
cp .env.example .env.local

# Rode em desenvolvimento
npm run dev
```

#### Fluxo de Trabalho

1. **Fork** o projeto
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Commit suas mudanças**:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```
4. **Push para o GitHub**:
   ```bash
   git push origin feature/minha-feature
   ```
5. **Abra um Pull Request**

## 📏 Padrões de Código

### TypeScript

- ✅ Use TypeScript para todos os arquivos
- ✅ Defina tipos explícitos
- ✅ Evite `any` quando possível

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ Evite
function getUser(id: any): any {
  // ...
}
```

### Componentes React

- ✅ Use componentes funcionais
- ✅ Prefira Server Components quando possível
- ✅ Use 'use client' apenas quando necessário

```typescript
// ✅ Server Component (padrão)
export default function MyComponent() {
  return <div>Hello</div>;
}

// ✅ Client Component (quando necessário)
'use client';
export default function MyClientComponent() {
  const [state, setState] = useState();
  return <div>Interactive</div>;
}
```

### Naming Conventions

- **Componentes**: PascalCase (`MyComponent.tsx`)
- **Funções**: camelCase (`getUserData()`)
- **Constantes**: UPPER_SNAKE_CASE (`API_KEY`)
- **Arquivos**: kebab-case para utils (`youtube-api.ts`)

### Organização de Imports

```typescript
// 1. Imports externos
import { useState } from 'react';
import axios from 'axios';

// 2. Imports internos
import { formatNumber } from '@/lib/utils';
import { Channel } from '@/lib/db';

// 3. Imports de componentes
import RankingTable from '@/components/RankingTable';

// 4. Imports de estilos (se houver)
import styles from './styles.module.css';
```

### Comentários

```typescript
// ✅ Bom: explica o "porquê"
// Delay para respeitar rate limit da API do YouTube
await new Promise(resolve => setTimeout(resolve, 1000));

// ❌ Ruim: explica o "o quê" (óbvio)
// Incrementa contador
counter++;
```

## 🎨 Estilo de Código

### Prettier (não obrigatório, mas recomendado)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ESLint

Rode antes de commitar:
```bash
npm run lint
```

Corrija warnings e erros.

## 🧪 Testes

Atualmente não temos testes automatizados, mas ao contribuir:

### Checklist de Testes Manuais

- [ ] Funciona em desenvolvimento (`npm run dev`)
- [ ] Build passa (`npm run build`)
- [ ] Funciona em produção (`npm start`)
- [ ] Testado no Chrome
- [ ] Testado no Firefox
- [ ] Testado no Safari (se possível)
- [ ] Funciona no mobile
- [ ] Sem erros no console
- [ ] Sem warnings do ESLint

## 📝 Mensagens de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
feat: adiciona filtro de busca por nome
feat(api): implementa endpoint de estatísticas

# Correções
fix: corrige erro ao carregar thumbnails
fix(ui): ajusta layout mobile

# Documentação
docs: atualiza README com novas instruções
docs(setup): adiciona guia de Firebase

# Refatoração
refactor: melhora performance da query
refactor(components): separa lógica do RankingTable

# Estilo
style: formata código com prettier
style(ui): ajusta espaçamento dos cards

# Testes
test: adiciona testes para formatNumber

# Chores
chore: atualiza dependências
chore(deps): bump next to 14.2.5
```

## 🌳 Estrutura de Branches

- `main` - Produção estável
- `develop` - Desenvolvimento ativo
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações

## 📦 Pull Requests

### Template de PR

```markdown
## Descrição
Breve descrição do que foi alterado

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testado localmente
- [ ] Build passa
- [ ] Documentação atualizada (se necessário)
- [ ] Sem warnings do ESLint
```

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
app/
  ├── api/              # API Routes
  ├── channel/          # Páginas de canal
  ├── globals.css       # Estilos globais
  ├── layout.tsx        # Layout principal
  └── page.tsx          # Página inicial

components/            # Componentes React
  ├── RankingTable.tsx
  ├── StatsChart.tsx
  └── ...

lib/                   # Lógica de negócio
  ├── db.ts            # Operações Firestore
  ├── youtube.ts       # YouTube API
  └── utils.ts         # Utilidades
```

### Fluxo de Dados

```
User Action → Component → API Route → lib/youtube.ts → YouTube API
                                   ↓
                              lib/db.ts → Firebase
                                   ↓
                              Component (updated)
```

## 🎯 Áreas que Precisam de Ajuda

### Alta Prioridade
- 🧪 Testes automatizados
- 📱 Melhorias de acessibilidade
- ⚡ Otimizações de performance
- 🌍 Internacionalização (i18n)

### Média Prioridade
- 📊 Novos tipos de gráficos
- 🎨 Temas customizáveis
- 🔔 Sistema de notificações
- 📈 Mais métricas analíticas

### Baixa Prioridade
- 🎭 Animações avançadas
- 🎨 Mais opções de design
- 📱 App mobile nativo
- 🤖 Bot do Discord/Telegram

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)

## ❓ Dúvidas?

- 📖 Leia a documentação no README.md
- 🔧 Veja o TROUBLESHOOTING.md
- 💬 Abra uma issue com a tag `question`

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.

---

**Obrigado por contribuir!** 🎉

Toda contribuição, grande ou pequena, é valiosa e apreciada!

