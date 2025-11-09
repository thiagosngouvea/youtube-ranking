import { NextRequest, NextResponse } from 'next/server';
import { removeSecondaryChannel } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-api';

export async function POST(request: NextRequest) {
  // Verificar se é admin
  const authError = await requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status }
    );
  }

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

