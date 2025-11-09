import { NextRequest } from 'next/server';

// Lista de emails de administradores
// Em produção, isso deveria estar em um banco de dados ou Firebase Custom Claims
const ADMIN_EMAILS = [
  'admin@example.com',
  // Adicione emails de administradores aqui
];

/**
 * Verifica se o usuário é admin baseado no token Firebase
 * Em produção, use Firebase Admin SDK para verificar custom claims
 */
export async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    // Por enquanto, vamos usar um header simples
    // Em produção, você deve verificar o token Firebase usando Firebase Admin SDK
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return false;
    }

    // Aqui você implementaria a verificação do token Firebase
    // const token = authHeader.replace('Bearer ', '');
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // return ADMIN_EMAILS.includes(decodedToken.email || '');
    
    // Por simplicidade, retornamos true se houver um header de autorização
    // ⚠️ IMPORTANTE: Isso é apenas para desenvolvimento! 
    // Em produção, implemente a verificação real do token!
    return true;
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

