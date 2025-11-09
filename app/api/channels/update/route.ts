import { NextRequest, NextResponse } from 'next/server';
import { getAllChannels, saveChannel, saveVideo, saveChannelStats, getRecentVideos } from '@/lib/db';
import { getChannelDetails, getChannelVideos } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId } = body;
    
    let channelsToUpdate = [];
    
    if (channelId) {
      // Update single channel
      channelsToUpdate = [{ id: channelId, category: 'general' }];
    } else {
      // Update all channels
      const allChannels = await getAllChannels();
      channelsToUpdate = allChannels.map(c => ({ id: c.id, category: c.category }));
    }
    
    const results = [];
    
    for (const channel of channelsToUpdate) {
      try {
        // Fetch latest channel data
        const channelData = await getChannelDetails(channel.id);
        
        if (!channelData) {
          results.push({ id: channel.id, success: false, error: 'Channel not found' });
          continue;
        }
        
        // Save channel data
        await saveChannel({
          ...channelData,
          category: channel.category,
        });
        
        // Fetch recent videos (last 30 days) - agora com paginação até 200 vídeos
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const videos = await getChannelVideos(channel.id, 200, thirtyDaysAgo);
        
        // Save videos
        for (const video of videos) {
          await saveVideo(video);
        }
        
        // Get stats from saved videos
        const recentVideos = await getRecentVideos(channel.id, 30);
        const totalLikes = recentVideos.reduce((sum, v) => sum + v.likeCount, 0);
        const totalComments = recentVideos.reduce((sum, v) => sum + v.commentCount, 0);
        const viewsLast30Days = recentVideos.reduce((sum, v) => sum + v.viewCount, 0);
        
        // Save channel stats
        await saveChannelStats({
          channelId: channel.id,
          date: new Date(),
          subscriberCount: channelData.subscriberCount,
          videoCount: channelData.videoCount,
          viewCount: channelData.viewCount,
          totalLikes,
          totalComments,
          videosLast30Days: recentVideos.length,
          viewsLast30Days,
        });
        
        results.push({ 
          id: channel.id, 
          success: true, 
          videosUpdated: videos.length 
        });
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error updating channel ${channel.id}:`, error);
        results.push({ 
          id: channel.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      results
    });
  } catch (error) {
    console.error('Error updating channels:', error);
    return NextResponse.json(
      { error: 'Failed to update channels' },
      { status: 500 }
    );
  }
}

