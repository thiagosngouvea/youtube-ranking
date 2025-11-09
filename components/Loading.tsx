'use client';

import { RefreshCw } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Carregando...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

