/**
 * Script para inicializar o Firestore com canais de exemplo
 * Execute com: npx ts-node scripts/init-firestore.ts
 */

import { saveChannel } from '../lib/db';

const exampleChannels = [
  {
    id: 'UCE_W61u3nInJOcRQx2Bm2ng',
    title: 'Flow Podcast',
    description: 'O maior podcast do Brasil',
    thumbnailUrl: '',
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    category: 'principal',
    publishedAt: new Date(),
  },
  {
    id: 'UCV306eHqgo0LvBf3Mh36AHg',
    title: 'PodPah',
    description: 'Podcast descontraído',
    thumbnailUrl: '',
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    category: 'principal',
    publishedAt: new Date(),
  },
];

async function initializeFirestore() {
  console.log('🚀 Inicializando Firestore com canais de exemplo...');

  try {
    for (const channel of exampleChannels) {
      console.log(`📝 Adicionando canal: ${channel.title}`);
      await saveChannel(channel);
    }

    console.log('✅ Firestore inicializado com sucesso!');
    console.log('💡 Acesse http://localhost:3000 e clique em "Atualizar Dados"');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firestore:', error);
    process.exit(1);
  }
}

initializeFirestore();

