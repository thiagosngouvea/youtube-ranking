import { NextRequest, NextResponse } from 'next/server';
import { getPrimaryChannels, getGroupMetrics } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // 30, 14, 7, 1
    const videoType = searchParams.get('type') as 'normal' | 'shorts' | null;
    const daysAgo = parseInt(period);
    
    // Buscar apenas canais principais
    const primaryChannels = await getPrimaryChannels();
    
    // Calcular métricas agregadas para cada grupo
    const groupsWithMetrics = await Promise.all(
      primaryChannels.map(async (channel) => {
        const metrics = await getGroupMetrics(channel.id, daysAgo);
        
        return {
          primaryChannel: channel,
          groupName: metrics.groupName,
          totalViews: metrics.totalViews,
          totalVideos: metrics.totalVideos,
          totalLikes: metrics.totalLikes,
          totalComments: metrics.totalComments,
          totalSubscribers: metrics.totalSubscribers,
          channelsInGroup: metrics.channels.length,
          channels: metrics.channels,
          engagementRate: metrics.totalViews > 0 
            ? ((metrics.totalLikes + metrics.totalComments) / metrics.totalViews) * 100 
            : 0,
          averageViewsPerVideo: metrics.totalVideos > 0 
            ? metrics.totalViews / metrics.totalVideos 
            : 0,
        };
      })
    );
    
    // Ordenar por total de views
    const sortedGroups = groupsWithMetrics.sort((a, b) => b.totalViews - a.totalViews);
    
    return NextResponse.json({
      success: true,
      ranking: sortedGroups,
    });
  } catch (error) {
    console.error('Error fetching group ranking:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ranking de grupos' },
      { status: 500 }
    );
  }
}

