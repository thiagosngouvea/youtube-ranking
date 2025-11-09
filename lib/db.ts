import { db } from './firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { cache, CACHE_TTL } from './cache';

export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  category: string;
  customUrl?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // Campos para agrupamento de canais
  parentChannelId?: string; // ID do canal principal (se for secundário)
  secondaryChannelIds?: string[]; // IDs dos canais secundários (se for principal)
  groupName?: string; // Nome do grupo (ex: "Flow Podcast Network")
}

export interface Video {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  videoType: 'normal' | 'shorts';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelStats {
  id: string;
  channelId: string;
  date: Date;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  totalLikes: number;
  totalComments: number;
  videosLast30Days: number;
  viewsLast30Days: number;
}

// Channel operations
export async function saveChannel(channel: Omit<Channel, 'createdAt' | 'updatedAt'>): Promise<void> {
  const channelRef = db.collection('channels').doc(channel.id);
  const now = Timestamp.now();
  
  await channelRef.set({
    ...channel,
    viewCount: Number(channel.viewCount),
    publishedAt: Timestamp.fromDate(channel.publishedAt),
    updatedAt: now,
    // Garantir valores padrão para campos de agrupamento
    parentChannelId: channel.parentChannelId || null,
    secondaryChannelIds: channel.secondaryChannelIds || [],
    groupName: channel.groupName || null,
  }, { merge: true });
  
  // Set createdAt only if it's a new document
  const doc = await channelRef.get();
  if (!doc.data()?.createdAt) {
    await channelRef.update({ createdAt: now });
  }
}

export async function getChannel(channelId: string): Promise<Channel | null> {
  // Verificar cache primeiro
  const cacheKey = `channel_${channelId}`;
  const cached = cache.get<Channel | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const doc = await db.collection('channels').doc(channelId).get();
  
  if (!doc.exists) {
    cache.set(cacheKey, null, CACHE_TTL.CHANNELS);
    return null;
  }
  
  const data = doc.data()!;
  const channel: Channel = {
    id: doc.id,
    title: data.title,
    description: data.description || '',
    thumbnailUrl: data.thumbnailUrl || '',
    subscriberCount: data.subscriberCount || 0,
    videoCount: data.videoCount || 0,
    viewCount: data.viewCount || 0,
    category: data.category || 'principal',
    customUrl: data.customUrl,
    parentChannelId: data.parentChannelId || undefined,
    secondaryChannelIds: data.secondaryChannelIds || [],
    groupName: data.groupName || undefined,
    publishedAt: data.publishedAt?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };

  cache.set(cacheKey, channel, CACHE_TTL.CHANNELS);
  return channel;
}

export async function getAllChannels(category?: string): Promise<Channel[]> {
  // Verificar cache primeiro
  const cacheKey = `channels_${category || 'all'}`;
  const cached = cache.get<Channel[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Se não está em cache, buscar do Firestore
  let query = db.collection('channels').orderBy('viewCount', 'desc');
  
  if (category && category !== 'all') {
    query = query.where('category', '==', category) as any;
  }
  
  const snapshot = await query.get();
  
  const channels = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '',
      subscriberCount: data.subscriberCount || 0,
      videoCount: data.videoCount || 0,
      viewCount: data.viewCount || 0,
      category: data.category || 'principal',
      customUrl: data.customUrl,
      parentChannelId: data.parentChannelId || undefined,
      secondaryChannelIds: data.secondaryChannelIds || [],
      groupName: data.groupName || undefined,
      publishedAt: data.publishedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });

  // Armazenar em cache
  cache.set(cacheKey, channels, CACHE_TTL.CHANNELS);
  
  return channels;
}

// Video operations
export async function saveVideo(video: Omit<Video, 'createdAt' | 'updatedAt'>): Promise<void> {
  const videoRef = db.collection('videos').doc(video.id);
  const now = Timestamp.now();
  
  await videoRef.set({
    ...video,
    viewCount: Number(video.viewCount),
    videoType: video.videoType || 'normal',
    publishedAt: Timestamp.fromDate(video.publishedAt),
    updatedAt: now,
  }, { merge: true });
  
  const doc = await videoRef.get();
  if (!doc.data()?.createdAt) {
    await videoRef.update({ createdAt: now });
  }
}

export async function getChannelVideos(channelId: string, limit: number = 200): Promise<Video[]> {
  const snapshot = await db.collection('videos')
    .where('channelId', '==', channelId)
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      channelId: data.channelId,
      title: data.title,
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '',
      publishedAt: data.publishedAt?.toDate() || new Date(),
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      duration: data.duration || '',
      videoType: data.videoType || 'normal',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

export async function getRecentVideos(channelId: string, daysAgo: number = 30): Promise<Video[]> {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const snapshot = await db.collection('videos')
    .where('channelId', '==', channelId)
    .where('publishedAt', '>=', Timestamp.fromDate(date))
    .orderBy('publishedAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      channelId: data.channelId,
      title: data.title,
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '',
      publishedAt: data.publishedAt?.toDate() || new Date(),
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      duration: data.duration || '',
      videoType: data.videoType || 'normal',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

// ChannelStats operations
export async function saveChannelStats(stats: Omit<ChannelStats, 'id'>): Promise<void> {
  const statsRef = db.collection('channelStats').doc();
  
  await statsRef.set({
    ...stats,
    viewCount: Number(stats.viewCount),
    viewsLast30Days: Number(stats.viewsLast30Days),
    date: Timestamp.fromDate(stats.date),
  });
}

export async function getChannelStats(channelId: string, limit: number = 30): Promise<ChannelStats[]> {
  const snapshot = await db.collection('channelStats')
    .where('channelId', '==', channelId)
    .orderBy('date', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      channelId: data.channelId,
      date: data.date?.toDate() || new Date(),
      subscriberCount: data.subscriberCount || 0,
      videoCount: data.videoCount || 0,
      viewCount: data.viewCount || 0,
      totalLikes: data.totalLikes || 0,
      totalComments: data.totalComments || 0,
      videosLast30Days: data.videosLast30Days || 0,
      viewsLast30Days: data.viewsLast30Days || 0,
    };
  });
}

export async function getLatestChannelStats(channelId: string): Promise<ChannelStats | null> {
  const snapshot = await db.collection('channelStats')
    .where('channelId', '==', channelId)
    .orderBy('date', 'desc')
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    channelId: data.channelId,
    date: data.date?.toDate() || new Date(),
    subscriberCount: data.subscriberCount || 0,
    videoCount: data.videoCount || 0,
    viewCount: data.viewCount || 0,
    totalLikes: data.totalLikes || 0,
    totalComments: data.totalComments || 0,
    videosLast30Days: data.videosLast30Days || 0,
    viewsLast30Days: data.viewsLast30Days || 0,
  };
}

// Get videos by date range for all channels
export async function getVideosByDateRange(daysAgo: number, videoType?: 'normal' | 'shorts'): Promise<Video[]> {
  // Verificar cache primeiro (CRÍTICO para economizar reads)
  const cacheKey = `videos_range_${daysAgo}_${videoType || 'all'}`;
  const cached = cache.get<Video[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Se não está em cache, buscar do Firestore
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  
  let query = db.collection('videos')
    .where('publishedAt', '>=', Timestamp.fromDate(date));
  
  if (videoType) {
    query = query.where('videoType', '==', videoType) as any;
  }
  
  const snapshot = await query.orderBy('publishedAt', 'desc').get();
  
  const videos = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      channelId: data.channelId,
      title: data.title,
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '',
      publishedAt: data.publishedAt?.toDate() || new Date(),
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      duration: data.duration || '',
      videoType: data.videoType || 'normal',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });

  // Armazenar em cache por 12 horas (dados atualizados a cada 12h)
  cache.set(cacheKey, videos, CACHE_TTL.VIDEOS);
  
  return videos;
}

// ===== Funções de Gerenciamento de Grupos de Canais =====

/**
 * Adiciona um canal secundário a um canal principal
 */
export async function addSecondaryChannel(
  primaryChannelId: string,
  secondaryChannelId: string,
  groupName?: string
): Promise<void> {
  const primaryRef = db.collection('channels').doc(primaryChannelId);
  const secondaryRef = db.collection('channels').doc(secondaryChannelId);
  
  const [primaryDoc, secondaryDoc] = await Promise.all([
    primaryRef.get(),
    secondaryRef.get(),
  ]);
  
  if (!primaryDoc.exists || !secondaryDoc.exists) {
    throw new Error('Canal principal ou secundário não encontrado');
  }
  
  const primaryData = primaryDoc.data()!;
  const currentSecondaryIds = primaryData.secondaryChannelIds || [];
  
  if (!currentSecondaryIds.includes(secondaryChannelId)) {
    await primaryRef.update({
      secondaryChannelIds: [...currentSecondaryIds, secondaryChannelId],
      groupName: groupName || primaryData.groupName || primaryData.title,
      updatedAt: Timestamp.now(),
    });
  }
  
  await secondaryRef.update({
    parentChannelId: primaryChannelId,
    groupName: groupName || primaryData.groupName || primaryData.title,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Remove um canal secundário de um canal principal
 */
export async function removeSecondaryChannel(
  primaryChannelId: string,
  secondaryChannelId: string
): Promise<void> {
  const primaryRef = db.collection('channels').doc(primaryChannelId);
  const secondaryRef = db.collection('channels').doc(secondaryChannelId);
  
  const primaryDoc = await primaryRef.get();
  if (primaryDoc.exists) {
    const data = primaryDoc.data()!;
    const secondaryIds = (data.secondaryChannelIds || []).filter(
      (id: string) => id !== secondaryChannelId
    );
    
    await primaryRef.update({
      secondaryChannelIds: secondaryIds,
      updatedAt: Timestamp.now(),
    });
  }
  
  await secondaryRef.update({
    parentChannelId: FieldValue.delete(),
    groupName: FieldValue.delete(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Busca todos os canais de um grupo (principal + secundários)
 */
export async function getChannelGroup(primaryChannelId: string): Promise<Channel[]> {
  const primary = await getChannel(primaryChannelId);
  
  if (!primary) {
    return [];
  }
  
  const channels: Channel[] = [primary];
  
  if (primary.secondaryChannelIds && primary.secondaryChannelIds.length > 0) {
    const secondaryPromises = primary.secondaryChannelIds.map(id => getChannel(id));
    const secondaries = await Promise.all(secondaryPromises);
    channels.push(...secondaries.filter((c): c is Channel => c !== null));
  }
  
  return channels;
}

/**
 * Busca apenas canais principais (categoria 'principal')
 */
export async function getPrimaryChannels(category?: string): Promise<Channel[]> {
  let query = db.collection('channels')
    .where('category', '==', 'principal')
    .orderBy('viewCount', 'desc');
  
  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '',
      subscriberCount: data.subscriberCount || 0,
      videoCount: data.videoCount || 0,
      viewCount: data.viewCount || 0,
      category: data.category || 'principal',
      customUrl: data.customUrl,
      parentChannelId: data.parentChannelId || undefined,
      secondaryChannelIds: data.secondaryChannelIds || [],
      groupName: data.groupName || undefined,
      publishedAt: data.publishedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Calcula métricas agregadas de um grupo de canais
 */
export interface GroupMetrics {
  groupName: string;
  totalViews: number;
  totalVideos: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribers: number;
  channels: Channel[];
}

export async function getGroupMetrics(
  primaryChannelId: string,
  daysAgo?: number,
  videoType?: 'normal' | 'shorts'
): Promise<GroupMetrics> {
  // Verificar cache primeiro
  const cacheKey = `group_metrics_${primaryChannelId}_${daysAgo || 'all'}_${videoType || 'all'}`;
  const cached = cache.get<GroupMetrics>(cacheKey);
  if (cached) {
    return cached;
  }

  const channels = await getChannelGroup(primaryChannelId);
  const channelIds = channels.map(c => c.id);
  
  let totalViews = 0;
  let totalVideos = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalSubscribers = 0;
  
  if (daysAgo) {
    // Métricas do período - buscar vídeos de todos os canais do grupo
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);
    
    // Buscar vídeos em chunks de 10 (limite do Firestore para 'in')
    for (let i = 0; i < channelIds.length; i += 10) {
      const chunk = channelIds.slice(i, i + 10);
      let query = db.collection('videos')
        .where('channelId', 'in', chunk)
        .where('publishedAt', '>=', Timestamp.fromDate(date));
      
      // Filtrar por tipo de vídeo se especificado
      if (videoType) {
        query = query.where('videoType', '==', videoType) as any;
      }
      
      const snapshot = await query.get();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.viewCount || 0;
        totalLikes += data.likeCount || 0;
        totalComments += data.commentCount || 0;
        totalVideos++;
      });
    }
  } else {
    // Métricas totais dos canais
    channels.forEach(channel => {
      totalViews += channel.viewCount;
      totalVideos += channel.videoCount;
    });
  }
  
  // Subscribers são sempre do total
  channels.forEach(channel => {
    totalSubscribers += channel.subscriberCount;
  });
  
  const primary = channels.find(c => c.category === 'principal');
  const groupName = primary?.groupName || primary?.title || 'Grupo sem nome';
  
  const metrics: GroupMetrics = {
    groupName,
    totalViews,
    totalVideos,
    totalLikes,
    totalComments,
    totalSubscribers,
    channels,
  };

  // Armazenar em cache
  cache.set(cacheKey, metrics, daysAgo ? CACHE_TTL.VIDEOS : CACHE_TTL.CHANNELS);
  
  return metrics;
}

