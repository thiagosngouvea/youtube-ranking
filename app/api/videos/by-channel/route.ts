import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');
    const daysAgo = parseInt(searchParams.get('daysAgo') || '30');
    const videoType = searchParams.get('videoType') as 'normal' | 'shorts' | null;
    const limit = parseInt(searchParams.get('limit') || '5');
    const lastVideoId = searchParams.get('lastVideoId'); // Para paginação

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Calcular data de início
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysAgo);

    // Query base
    let query = db.collection('videos')
      .where('channelId', '==', channelId)
      .where('publishedAt', '>=', Timestamp.fromDate(dateLimit));

    // Filtrar por tipo de vídeo se especificado
    if (videoType) {
      query = query.where('videoType', '==', videoType) as any;
    }

    // Ordenar e aplicar limite
    query = query
      .orderBy('publishedAt', 'desc')
      .orderBy('viewCount', 'desc')
      .limit(limit) as any;

    // Se tiver lastVideoId, começar depois dele (paginação)
    if (lastVideoId) {
      const lastDoc = await db.collection('videos').doc(lastVideoId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc) as any;
      }
    }

    const snapshot = await query.get();

    const videos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl || '',
        publishedAt: data.publishedAt?.toDate() || new Date(),
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        videoType: data.videoType || 'normal',
      };
    });

    return NextResponse.json({
      videos,
      hasMore: videos.length === limit, // Se retornou o limite completo, pode haver mais
      lastVideoId: videos.length > 0 ? videos[videos.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error fetching videos by channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

