import { NextRequest, NextResponse } from 'next/server';
import { saveChannel } from '@/lib/db';
import { getChannelByInput } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, category } = body;
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID or URL is required' },
        { status: 400 }
      );
    }
    
    // Fetch channel details from YouTube
    // Aceita: ID, URL com @handle, URL com /channel/, ou @handle direto
    const channelData = await getChannelByInput(channelId);
    
    if (!channelData) {
      return NextResponse.json(
        { error: 'Channel not found. Please check the URL or ID and try again.' },
        { status: 404 }
      );
    }
    
    // Save to database
    await saveChannel({
      ...channelData,
      category: category || 'general',
    });
    
    return NextResponse.json({ 
      success: true,
      channel: channelData
    });
  } catch (error) {
    console.error('Error adding channel:', error);
    return NextResponse.json(
      { error: 'Failed to add channel' },
      { status: 500 }
    );
  }
}

