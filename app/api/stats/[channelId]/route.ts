import { NextRequest, NextResponse } from 'next/server';
import { getChannelStats } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const channelId = params.channelId;
    const stats = await getChannelStats(channelId, 30);
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

