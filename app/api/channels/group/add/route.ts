import { NextRequest, NextResponse } from 'next/server';
import { addSecondaryChannel } from '@/lib/db';
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
    const { primaryChannelId, secondaryChannelId, groupName } = await request.json();

    if (!primaryChannelId || !secondaryChannelId) {
      return NextResponse.json(
        { error: 'IDs dos canais são obrigatórios' },
        { status: 400 }
      );
    }

    await addSecondaryChannel(primaryChannelId, secondaryChannelId, groupName);

    return NextResponse.json({
      success: true,
      message: 'Canal secundário adicionado com sucesso',
    });
  } catch (error) {
    console.error('Error adding secondary channel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao adicionar canal secundário' },
      { status: 500 }
    );
  }
}

