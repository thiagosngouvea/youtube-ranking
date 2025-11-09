/**
 * Sistema de Cache em Memória para Reduzir Reads do Firestore
 * 
 * Como os dados são atualizados apenas a cada 12 horas,
 * não precisamos buscar do Firestore toda vez.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Busca um item do cache
   * @param key Chave única do cache
   * @returns Dados em cache ou null se expirado/inexistente
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Verificar se o cache expirou
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT: ${key} (idade: ${Math.round(age / 1000)}s)`);
    return entry.data as T;
  }

  /**
   * Armazena um item no cache
   * @param key Chave única do cache
   * @param data Dados a serem armazenados
   * @param ttl Time to live em milissegundos (padrão: 12 horas)
   */
  set<T>(key: string, data: T, ttl: number = 12 * 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${Math.round(ttl / 1000 / 60)}min)`);
  }

  /**
   * Remove um item específico do cache
   * @param key Chave do cache a ser removida
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️  Cache DELETE: ${key}`);
  }

  /**
   * Remove todos os itens que começam com um prefixo
   * @param prefix Prefixo das chaves a serem removidas
   */
  deleteByPrefix(prefix: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`🗑️  Cache DELETE por prefixo: ${prefix} (${count} itens)`);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cache CLEAR: ${size} itens removidos`);
  }

  /**
   * Remove itens expirados do cache
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cache CLEANUP: ${removed} itens expirados removidos`);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instância global do cache
export const cache = new MemoryCache();

// TTLs pré-definidos
// Como os dados são atualizados apenas a cada 12 horas,
// todos podem ter cache de 12 horas para máxima economia
export const CACHE_TTL = {
  VIDEOS: 12 * 60 * 60 * 1000,      // 12 horas
  CHANNELS: 1 * 60 * 1000,    // 12 horas
  STATS: 12 * 60 * 60 * 1000,       // 12 horas
  RANKING: 12 * 60 * 60 * 1000,     // 12 horas
} as const;

// Cleanup automático a cada 1 hora
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 60 * 60 * 1000);
}

/**
 * Invalida caches relacionados após atualização de dados
 */
export function invalidateAfterUpdate(channelId?: string): void {
  console.log('🔄 Invalidando caches após atualização...');
  
  if (channelId) {
    // Invalidar caches específicos do canal
    cache.deleteByPrefix(`channel_${channelId}`);
    cache.deleteByPrefix(`videos_${channelId}`);
    cache.deleteByPrefix(`stats_${channelId}`);
  } else {
    // Invalidar todos os caches de dados
    cache.deleteByPrefix('channels_');
    cache.deleteByPrefix('videos_');
    cache.deleteByPrefix('stats_');
    cache.deleteByPrefix('ranking_');
    cache.deleteByPrefix('group_');
  }
}

export default cache;

