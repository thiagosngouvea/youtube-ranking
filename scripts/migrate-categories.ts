/**
 * Script de Migração de Categorias
 * 
 * Atualiza todas as categorias antigas para as novas:
 * - "geral" ou qualquer outra categoria antiga → "principal", "cortes" ou "outros"
 * 
 * Como executar:
 * npx ts-node scripts/migrate-categories.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Inicializar Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error);
    process.exit(1);
  }
}

const db = getFirestore();

// Categorias válidas
const VALID_CATEGORIES = ['principal', 'cortes', 'outros'];

// Mapeamento de categorias antigas para novas
const CATEGORY_MAPPING: { [key: string]: string } = {
  'general': 'principal',
  'geral': 'principal',
  'humor': 'outros',
  'entrevistas': 'principal',
  'politica': 'outros',
  'negocios': 'outros',
  'esportes': 'outros',
  'tecnologia': 'outros',
  'educacao': 'outros',
  'entretenimento': 'outros',
};

async function migrateCategories() {
  try {
    console.log('🔄 Iniciando migração de categorias...\n');

    // Buscar todos os canais
    const snapshot = await db.collection('channels').get();
    
    if (snapshot.empty) {
      console.log('ℹ️  Nenhum canal encontrado no banco de dados.');
      return;
    }

    console.log(`📊 Encontrados ${snapshot.size} canais para processar\n`);

    let updatedCount = 0;
    let unchangedCount = 0;
    const updates: Promise<any>[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const currentCategory = data.category || 'general';
      
      // Verificar se a categoria precisa ser atualizada
      if (!VALID_CATEGORIES.includes(currentCategory)) {
        const newCategory = CATEGORY_MAPPING[currentCategory] || 'principal';
        
        console.log(`  📝 Canal: ${data.title || doc.id}`);
        console.log(`     Categoria: "${currentCategory}" → "${newCategory}"`);
        
        updates.push(
          doc.ref.update({
            category: newCategory,
            updatedAt: new Date(),
          })
        );
        
        updatedCount++;
      } else {
        unchangedCount++;
      }
    });

    // Executar todas as atualizações
    if (updates.length > 0) {
      console.log(`\n⏳ Atualizando ${updates.length} canal(is)...`);
      await Promise.all(updates);
      console.log('✅ Atualização concluída!');
    }

    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(50));
    console.log(`Total de canais: ${snapshot.size}`);
    console.log(`✅ Atualizados: ${updatedCount}`);
    console.log(`✓  Já estavam corretos: ${unchangedCount}`);
    console.log('='.repeat(50));
    console.log('\n✨ Migração concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar a migração
migrateCategories()
  .then(() => {
    console.log('\n👋 Finalizando...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });

