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
  videoType: 'normal' | 'shorts';
}

/**
 * Detecta o tipo de vídeo baseado apenas na duração
 * - Shorts: duração < 5 minutos (300 segundos)
 * - Normal: vídeos com 5 minutos ou mais (incluindo lives)
 */
function detectVideoType(duration: string): 'normal' | 'shorts' {
  // Parse ISO 8601 duration (ex: PT1M30S = 1 minuto e 30 segundos)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) {
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    // Shorts são vídeos com menos de 5 minutos (300 segundos)
    if (totalSeconds < 300) {
      return 'shorts';
    }
  }
  
  return 'normal';
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
  maxResults: number = 200,
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

    // Collect all video IDs using pagination
    let allVideoIds: string[] = [];
    let pageToken: string | undefined = undefined;
    let totalFetched = 0;

    // Loop through pages until we have enough videos or no more pages
    while (totalFetched < maxResults) {
      const remaining = maxResults - totalFetched;
      const batchSize = Math.min(remaining, 50); // YouTube API limit per request

      const playlistParams: any = {
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: batchSize,
        key: YOUTUBE_API_KEY,
      };

      // Add pageToken if we're fetching subsequent pages
      if (pageToken) {
        playlistParams.pageToken = pageToken;
      }

      const playlistResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
        params: playlistParams,
      });

      const videoIds = playlistResponse.data.items
        .map((item: any) => item.snippet.resourceId.videoId)
        .filter((id: string) => id);

      allVideoIds.push(...videoIds);
      totalFetched += videoIds.length;

      // Get next page token
      pageToken = playlistResponse.data.nextPageToken;

      // If no more pages or no videos in this page, stop
      if (!pageToken || videoIds.length === 0) {
        break;
      }
    }

    if (allVideoIds.length === 0) {
      return [];
    }

    // Fetch video details in batches (API allows up to 50 IDs per request)
    const allVideos: YouTubeVideo[] = [];
    const chunkSize = 50;

    for (let i = 0; i < allVideoIds.length; i += chunkSize) {
      const chunk = allVideoIds.slice(i, i + chunkSize);

      const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: chunk.join(','),
          key: YOUTUBE_API_KEY,
        },
      });

      const videos: YouTubeVideo[] = videosResponse.data.items.map((video: any) => {
        const publishedAt = new Date(video.snippet.publishedAt);
        
        // Filter by publishedAfter if provided
        if (publishedAfter && publishedAt < publishedAfter) {
          return null;
        }

        const duration = video.contentDetails.duration;
        const videoType = detectVideoType(duration);

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
          duration,
          videoType,
        };
      }).filter((v: YouTubeVideo | null) => v !== null);

      allVideos.push(...videos);
    }

    return allVideos;
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

/**
 * Extrai o identificador (ID ou handle) de uma URL do YouTube
 * Suporta formatos:
 * - https://www.youtube.com/@handle
 * - https://www.youtube.com/c/customname
 * - https://www.youtube.com/channel/UCxxxxx
 * - https://youtube.com/@handle
 * - UCxxxxx (ID direto)
 */
export function extractChannelIdentifier(input: string): { type: 'id' | 'handle' | 'custom'; value: string } | null {
  // Remover espaços e quebras de linha
  const cleaned = input.trim();
  
  // Se já é um ID (começa com UC e tem ~24 caracteres)
  if (/^UC[\w-]{22}$/.test(cleaned)) {
    return { type: 'id', value: cleaned };
  }
  
  try {
    const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    
    // Formato: youtube.com/@handle
    if (url.pathname.startsWith('/@')) {
      const handle = url.pathname.substring(2).split('/')[0];
      return { type: 'handle', value: handle };
    }
    
    // Formato: youtube.com/c/customname
    if (url.pathname.startsWith('/c/')) {
      const custom = url.pathname.substring(3).split('/')[0];
      return { type: 'custom', value: custom };
    }
    
    // Formato: youtube.com/channel/UCxxxxx
    if (url.pathname.startsWith('/channel/')) {
      const id = url.pathname.substring(9).split('/')[0];
      return { type: 'id', value: id };
    }
  } catch (error) {
    // Se não for URL válida, tentar como handle simples
    if (cleaned.startsWith('@')) {
      return { type: 'handle', value: cleaned.substring(1) };
    }
  }
  
  return null;
}

/**
 * Busca o ID do canal a partir de um handle (@nome) ou custom URL
 */
export async function getChannelIdByHandle(handleOrCustom: string): Promise<string | null> {
  try {
    // Tenta buscar por forUsername (handle)
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'id',
        forHandle: handleOrCustom,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id;
    }

    // Se não encontrou, tenta buscar por forUsername (versão antiga)
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: handleOrCustom,
        type: 'channel',
        maxResults: 1,
        key: YOUTUBE_API_KEY,
      },
    });

    if (searchResponse.data.items && searchResponse.data.items.length > 0) {
      return searchResponse.data.items[0].id.channelId || searchResponse.data.items[0].snippet.channelId;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching channel ID for handle ${handleOrCustom}:`, error);
    return null;
  }
}

/**
 * Função principal para obter dados do canal a partir de qualquer input
 * Aceita: ID, URL, @handle
 */
export async function getChannelByInput(input: string): Promise<YouTubeChannel | null> {
  // Extrair identificador da URL ou input
  const identifier = extractChannelIdentifier(input);
  
  if (!identifier) {
    console.error('Could not extract channel identifier from input:', input);
    return null;
  }
  
  let channelId: string | null = null;
  
  if (identifier.type === 'id') {
    // Já temos o ID
    channelId = identifier.value;
  } else {
    // Precisamos buscar o ID pelo handle ou custom URL
    channelId = await getChannelIdByHandle(identifier.value);
  }
  
  if (!channelId) {
    console.error('Could not find channel ID for:', input);
    return null;
  }
  
  // Buscar detalhes completos do canal
  return await getChannelDetails(channelId);
}

