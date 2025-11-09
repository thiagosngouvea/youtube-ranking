import { NextRequest, NextResponse } from 'next/server';
import { getViralVideos } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');
    const videoType = searchParams.get('videoType') as 'normal' | 'shorts' | 'all' | null;

    // Converter período para daysAgo (null = todo histórico)
    let daysAgo: number | undefined;
    if (period && period !== 'all') {
      daysAgo = parseInt(period);
      if (isNaN(daysAgo)) {
        return NextResponse.json(
          { error: 'Invalid period parameter' },
          { status: 400 }
        );
      }
    }

    const viralVideos = await getViralVideos(
      daysAgo,
      videoType || 'all'
    );

    return NextResponse.json({
      videos: viralVideos,
      total: viralVideos.length,
    });
  } catch (error) {
    console.error('Error fetching viral videos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch viral videos' },
      { status: 500 }
    );
  }
}

