import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  customUrl?: string;
  publishedAt: Date;
}

export interface YouTubeVideo {
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
}

export async function getChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const channel = response.data.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;

    return {
      id: channel.id,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(statistics.subscriberCount || '0'),
      videoCount: parseInt(statistics.videoCount || '0'),
      viewCount: parseInt(statistics.viewCount || '0'),
      customUrl: snippet.customUrl,
      publishedAt: new Date(snippet.publishedAt),
    };
  } catch (error) {
    console.error(`Error fetching channel ${channelId}:`, error);
    return null;
  }
}

export async function getChannelVideos(
  channelId: string,
  maxResults: number = 50,
  publishedAfter?: Date
): Promise<YouTubeVideo[]> {
  try {
    // First, get the uploads playlist ID
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from the uploads playlist
    const playlistParams: any = {
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: Math.min(maxResults, 50),
      key: YOUTUBE_API_KEY,
    };

    const playlistResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
      params: playlistParams,
    });

    const videoIds = playlistResponse.data.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .filter((id: string) => id);

    if (videoIds.length === 0) {
      return [];
    }

    // Get video statistics
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    const videos: YouTubeVideo[] = videosResponse.data.items.map((video: any) => {
      const publishedAt = new Date(video.snippet.publishedAt);
      
      // Filter by publishedAfter if provided
      if (publishedAfter && publishedAt < publishedAfter) {
        return null;
      }

      return {
        id: video.id,
        channelId: video.snippet.channelId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        duration: video.contentDetails.duration,
      };
    }).filter((v: YouTubeVideo | null) => v !== null);

    return videos;
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    return [];
  }
}

export async function searchChannelsByKeyword(keyword: string, maxResults: number = 10): Promise<string[]> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: keyword,
        type: 'channel',
        maxResults,
        key: YOUTUBE_API_KEY,
      },
    });

    return response.data.items.map((item: any) => item.id.channelId);
  } catch (error) {
    console.error(`Error searching channels with keyword ${keyword}:`, error);
    return [];
  }
}

