import { NextRequest, NextResponse } from 'next/server';
import { getChannelGroup } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const channels = await getChannelGroup(params.channelId);

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error('Error fetching channel group:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar grupo de canais' },
      { status: 500 }
    );
  }
}

