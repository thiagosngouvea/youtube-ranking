# Sistema de Cache - Redução de Reads do Firestore

## 🎯 Objetivo

Reduzir drasticamente o consumo de reads do Firestore implementando cache em memória para queries frequentes.

**Problema Original:**
- 50.000 reads/dia esgotados rapidamente
- Cada mudança de filtro no Trending = centenas de reads
- Dados atualizados apenas a cada 12 horas, mas buscados constantemente

**Solução:**
- Cache em memória com TTL configurável
- Invalidação inteligente após atualizações
- Redução de **90-95% dos reads** em operações normais

## 📊 Impacto Esperado

### Antes do Cache:
```
Cenário típico:
- Carregar página principal: 10 reads
- Carregar Trending (30 dias): 500 reads
- Mudar para 14 dias: 300 reads
- Mudar para 7 dias: 200 reads
- Mudar para 1 dia: 100 reads
- Mudar tipo para Shorts: 100 reads
- 10 recargas durante desenvolvimento: 1.210 reads × 10 = 12.100 reads

Total: ~12.100 reads por sessão de teste 😱
```

### Depois do Cache:
```
Cenário típico:
- Primeira vez (cache vazio): 1.110 reads
- Mudanças de filtro: 0 reads (cache hit!)
- Recargas: 0 reads (cache hit!)
- Após 12 horas: Cache expira, nova busca necessária

Total: ~1.110 reads por dia de desenvolvimento ✅
Economia: ~91% de reads!
```

## 🔧 Como Funciona

### 1. Cache em Memória

```typescript
// lib/cache.ts
const cache = new Map<string, CacheEntry<any>>();

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}
```

### 2. TTLs Configurados

```typescript
export const CACHE_TTL = {
  VIDEOS: 12 * 60 * 60 * 1000,   // 12 horas - dados atualizados a cada 12h
  CHANNELS: 5 * 60 * 1000,        // 5 minutos - pode mudar com mais frequência
  STATS: 15 * 60 * 1000,          // 15 minutos
  RANKING: 30 * 60 * 1000,        // 30 minutos
};
```

### 3. Funções com Cache

#### getAllChannels()
```typescript
// Verificar cache primeiro
const cacheKey = `channels_${category || 'all'}`;
const cached = cache.get<Channel[]>(cacheKey);
if (cached) {
  return cached; // ✅ Cache HIT - 0 reads!
}

// Se não está em cache, buscar do Firestore
const snapshot = await query.get(); // ❌ Cache MISS - consome reads

// Armazenar em cache
cache.set(cacheKey, channels, CACHE_TTL.CHANNELS);
```

#### getVideosByDateRange()
```typescript
// CRÍTICO: Evita centenas de reads em cada mudança de filtro
const cacheKey = `videos_range_${daysAgo}_${videoType || 'all'}`;
const cached = cache.get<Video[]>(cacheKey);
if (cached) {
  return cached; // ✅ Cache HIT - economiza 100-500 reads!
}

// Buscar do Firestore e cachear por 12 horas
```

#### getChannel()
```typescript
const cacheKey = `channel_${channelId}`;
const cached = cache.get<Channel | null>(cacheKey);
if (cached !== null) {
  return cached; // ✅ Cache HIT - 0 reads!
}
```

#### getGroupMetrics()
```typescript
const cacheKey = `group_metrics_${primaryChannelId}_${daysAgo || 'all'}`;
const cached = cache.get<GroupMetrics>(cacheKey);
if (cached) {
  return cached; // ✅ Cache HIT - economiza dezenas de reads!
}
```

### 4. Invalidação de Cache

Após atualizar dados (botão "Atualizar Dados"), o cache é limpo:

```typescript
// app/api/channels/update/route.ts
import { invalidateAfterUpdate } from '@/lib/cache';

// Após atualizar dados
invalidateAfterUpdate(channelId);
```

**O que é invalidado:**
- Se `channelId` específico: apenas caches daquele canal
- Se atualização geral: todos os caches de dados

```typescript
export function invalidateAfterUpdate(channelId?: string): void {
  if (channelId) {
    cache.deleteByPrefix(`channel_${channelId}`);
    cache.deleteByPrefix(`videos_${channelId}`);
    cache.deleteByPrefix(`stats_${channelId}`);
  } else {
    cache.deleteByPrefix('channels_');
    cache.deleteByPrefix('videos_');
    cache.deleteByPrefix('stats_');
    cache.deleteByPrefix('ranking_');
    cache.deleteByPrefix('group_');
  }
}
```

## 🎮 Como Usar

### Automático
O cache funciona automaticamente! Não é necessário fazer nada.

### Monitoramento
Logs automáticos no console do servidor:

```
✅ Cache HIT: channels_all (idade: 45s)
💾 Cache SET: videos_range_30_all (TTL: 720min)
🗑️  Cache DELETE por prefixo: channels_ (3 itens)
🧹 Cache CLEANUP: 5 itens expirados removidos
```

### Estatísticas
```typescript
import { cache } from '@/lib/cache';

const stats = cache.stats();
console.log(`Cache size: ${stats.size}`);
console.log(`Cache keys:`, stats.keys);
```

### Limpeza Manual
```typescript
import { cache } from '@/lib/cache';

// Limpar cache específico
cache.delete('channels_all');

// Limpar por prefixo
cache.deleteByPrefix('videos_');

// Limpar tudo
cache.clear();
```

## 📈 Cenários de Uso

### Desenvolvimento
```
1. Primeira vez: Cache vazio, busca do Firestore
2. Recarregar página: Cache HIT, 0 reads
3. Mudar filtro no Trending: Cache HIT, 0 reads
4. Após 12 horas: Cache expira automaticamente
```

### Produção
```
1. Usuário A acessa: Cache vazio, busca do Firestore
2. Usuário B acessa (dentro de 12h): Cache HIT, 0 reads
3. Usuário C muda filtro: Cache HIT, 0 reads
4. Administrador atualiza dados: Cache invalidado
5. Próximo usuário: Nova busca, cache reconstruído
```

## ⚠️ Considerações

### Memória
- Cache em memória do servidor Next.js
- Reiniciar servidor = cache limpo
- Cada deploy = cache limpo
- Não persiste entre restarts

### Escalabilidade
Para produção com múltiplos servidores:
- Considerar Redis ou Memcached
- Cache compartilhado entre instâncias
- Por enquanto, cache local é suficiente

### Dados em Tempo Real
- Cache de 12 horas é apropriado pois dados são atualizados a cada 12h
- Se precisar dados mais frequentes, ajustar TTL:
  ```typescript
  cache.set(key, data, 1 * 60 * 60 * 1000); // 1 hora
  ```

## 🔍 Debug

### Ver todos os caches ativos
```typescript
const stats = cache.stats();
console.log(JSON.stringify(stats, null, 2));
```

### Forçar atualização
```typescript
import { invalidateAfterUpdate } from '@/lib/cache';
invalidateAfterUpdate(); // Limpa todos os caches
```

### Desabilitar cache (para debug)
Comentar as linhas de cache:
```typescript
// const cached = cache.get<Channel[]>(cacheKey);
// if (cached) return cached;
```

## 📊 Monitoramento de Quota

Após implementar cache:

1. Acesse Firebase Console
2. Vá em Firestore → Usage
3. Monitore reads diários
4. Deve ver redução de **90%+** comparado a antes

**Antes:** 50.000+ reads/dia (quota excedida)
**Depois:** ~5.000 reads/dia (confortável no free tier)

## 🚀 Próximos Passos (Opcional)

1. **Redis para Produção**
   ```bash
   npm install ioredis
   ```

2. **Cache HTTP com SWR no Cliente**
   ```bash
   npm install swr
   ```

3. **Service Worker para Cache Offline**
   - PWA com dados em cache local
   - Funciona mesmo offline

4. **Monitoramento Automático**
   - Dashboard de estatísticas do cache
   - Alertas de quota do Firestore

