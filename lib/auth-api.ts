import { NextRequest } from 'next/server';
import { adminAuth } from './firebase';

// Lista de emails de administradores
// Em produção, isso deveria estar em um banco de dados ou Firebase Custom Claims
const ADMIN_EMAILS = [
  'thiagonunes026@gmail.com',
  // Adicione mais emails de administradores aqui
];

/**
 * Verifica se o usuário é admin baseado no token Firebase
 */
export async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar o token usando Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Verificar se o email está na lista de admins
    return ADMIN_EMAILS.includes(decodedToken.email || '');
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
}

/**
 * Middleware para proteger rotas de API
 */
export async function requireAdmin(request: NextRequest) {
  const isAdmin = await isAdminUser(request);
  
  if (!isAdmin) {
    return {
      error: 'Unauthorized: Admin access required',
      status: 401
    };
  }
  
  return null;
}

