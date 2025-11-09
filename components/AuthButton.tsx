'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, Shield } from 'lucide-react';

export default function AuthButton() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded-lg"></div>
    );
  }

  if (user && isAdmin) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg">
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
            Admin
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/login')}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Admin</span>
    </button>
  );
}

