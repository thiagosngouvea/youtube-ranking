import { NextRequest, NextResponse } from 'next/server';
import { getAllChannels, saveChannel, saveVideo, saveChannelStats, getRecentVideos, getChannel } from '@/lib/db';
import { getChannelDetails, getChannelVideos } from '@/lib/youtube';
import { invalidateAfterUpdate } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId } = body;
    
    let channelsToUpdate = [];
    
    if (channelId) {
      // Update single channel - buscar canal completo do banco
      const existingChannel = await getChannel(channelId);
      if (!existingChannel) {
        return NextResponse.json(
          { error: 'Channel not found in database' },
          { status: 404 }
        );
      }
      channelsToUpdate = [existingChannel];
    } else {
      // Update all channels
      const allChannels = await getAllChannels();
      channelsToUpdate = allChannels;
    }
    
    const results = [];
    
    for (const existingChannel of channelsToUpdate) {
      try {
        // Fetch latest channel data from YouTube
        const channelData = await getChannelDetails(existingChannel.id);
        
        if (!channelData) {
          results.push({ id: existingChannel.id, success: false, error: 'Channel not found' });
          continue;
        }
        
        // Save channel data, preservando campos de agrupamento
        await saveChannel({
          ...channelData,
          category: existingChannel.category,
          // Preservar campos de agrupamento
          parentChannelId: existingChannel.parentChannelId,
          secondaryChannelIds: existingChannel.secondaryChannelIds,
          groupName: existingChannel.groupName,
        });
        
        // Fetch recent videos (last 30 days) - agora com paginação até 2000 vídeos
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const videos = await getChannelVideos(existingChannel.id, 2000, thirtyDaysAgo);
        
        // Save videos
        for (const video of videos) {
          await saveVideo(video);
        }
        
        // Get stats from saved videos
        const recentVideos = await getRecentVideos(existingChannel.id, 30);
        const totalLikes = recentVideos.reduce((sum, v) => sum + v.likeCount, 0);
        const totalComments = recentVideos.reduce((sum, v) => sum + v.commentCount, 0);
        const viewsLast30Days = recentVideos.reduce((sum, v) => sum + v.viewCount, 0);
        
        // Save channel stats
        await saveChannelStats({
          channelId: existingChannel.id,
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
          id: existingChannel.id, 
          success: true, 
          videosUpdated: videos.length 
        });
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error updating channel ${existingChannel.id}:`, error);
        results.push({ 
          id: existingChannel.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Invalidar cache após atualização
    invalidateAfterUpdate(channelId);
    
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

