import { NextRequest, NextResponse } from 'next/server';
import { removeSecondaryChannel } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { primaryChannelId, secondaryChannelId } = await request.json();

    if (!primaryChannelId || !secondaryChannelId) {
      return NextResponse.json(
        { error: 'IDs dos canais são obrigatórios' },
        { status: 400 }
      );
    }

    await removeSecondaryChannel(primaryChannelId, secondaryChannelId);

    return NextResponse.json({
      success: true,
      message: 'Canal secundário removido com sucesso',
    });
  } catch (error) {
    console.error('Error removing secondary channel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover canal secundário' },
      { status: 500 }
    );
  }
}

