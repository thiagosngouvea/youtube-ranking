import { db } from './firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

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
  }, { merge: true });
  
  // Set createdAt only if it's a new document
  const doc = await channelRef.get();
  if (!doc.data()?.createdAt) {
    await channelRef.update({ createdAt: now });
  }
}

export async function getChannel(channelId: string): Promise<Channel | null> {
  const doc = await db.collection('channels').doc(channelId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title,
    description: data.description || '',
    thumbnailUrl: data.thumbnailUrl || '',
    subscriberCount: data.subscriberCount || 0,
    videoCount: data.videoCount || 0,
    viewCount: data.viewCount || 0,
    category: data.category || 'general',
    customUrl: data.customUrl,
    publishedAt: data.publishedAt?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

export async function getAllChannels(category?: string): Promise<Channel[]> {
  let query = db.collection('channels').orderBy('viewCount', 'desc');
  
  if (category && category !== 'all') {
    query = query.where('category', '==', category) as any;
  }
  
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
      category: data.category || 'general',
      customUrl: data.customUrl,
      publishedAt: data.publishedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

// Video operations
export async function saveVideo(video: Omit<Video, 'createdAt' | 'updatedAt'>): Promise<void> {
  const videoRef = db.collection('videos').doc(video.id);
  const now = Timestamp.now();
  
  await videoRef.set({
    ...video,
    viewCount: Number(video.viewCount),
    publishedAt: Timestamp.fromDate(video.publishedAt),
    updatedAt: now,
  }, { merge: true });
  
  const doc = await videoRef.get();
  if (!doc.data()?.createdAt) {
    await videoRef.update({ createdAt: now });
  }
}

export async function getChannelVideos(channelId: string, limit: number = 50): Promise<Video[]> {
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

