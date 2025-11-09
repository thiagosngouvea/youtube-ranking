import { NextRequest, NextResponse } from 'next/server';
import { getAllChannels, getVideosByDateRange } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // 30, 14, 7, 1
    const videoType = searchParams.get('type') as 'normal' | 'shorts' | 'live' | null; // Filtro de tipo
    const daysAgo = parseInt(period);
    
    // Get all channels
    const channels = await getAllChannels();
    
    // Get videos from the period (com filtro de tipo opcional)
    const videos = await getVideosByDateRange(daysAgo, videoType || undefined);

    // console.log(videos.map(video => ({ title: video.title, publishedAt: video.publishedAt })));
    
    // Calculate views per channel in the period and group videos
    const channelViews = new Map<string, {
      viewCount: number;
      videoCount: number;
      likeCount: number;
      commentCount: number;
      videos: any[];
    }>();
    
    videos.forEach(video => {
      const existing = channelViews.get(video.channelId) || {
        viewCount: 0,
        videoCount: 0,
        likeCount: 0,
        commentCount: 0,
        videos: [],
      };
      
      channelViews.set(video.channelId, {
        viewCount: existing.viewCount + video.viewCount,
        videoCount: existing.videoCount + 1,
        likeCount: existing.likeCount + video.likeCount,
        commentCount: existing.commentCount + video.commentCount,
        videos: [...existing.videos, {
          id: video.id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          videoType: video.videoType,
        }],
      });
    });
    
    // Combine channel data with period stats
    const ranking = channels.map(channel => {
      const periodStats = channelViews.get(channel.id) || {
        viewCount: 0,
        videoCount: 0,
        likeCount: 0,
        commentCount: 0,
        videos: [],
      };
      
      return {
        ...channel,
        periodViews: periodStats.viewCount,
        periodVideos: periodStats.videoCount,
        periodLikes: periodStats.likeCount,
        periodComments: periodStats.commentCount,
        videos: periodStats.videos,
        engagementRate: periodStats.viewCount > 0 
          ? ((periodStats.likeCount + periodStats.commentCount) / periodStats.viewCount) * 100 
          : 0,
      };
    });
    
    // Sort by period views (descending)
    ranking.sort((a, b) => b.periodViews - a.periodViews);
    
    return NextResponse.json({ 
      ranking,
      period: daysAgo,
    });
  } catch (error) {
    console.error('Error fetching period ranking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranking' },
      { status: 500 }
    );
  }
}

