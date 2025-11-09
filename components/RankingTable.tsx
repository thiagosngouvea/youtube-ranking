'use client';

import { Channel } from '@/lib/db';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface RankingTableProps {
  channels: Channel[];
  previousStats?: Record<string, { viewCount: number; subscriberCount: number }>;
}

export default function RankingTable({ channels, previousStats }: RankingTableProps) {
  const getGrowthIndicator = (current: number, previous?: number) => {
    if (!previous) return <Minus className="w-4 h-4 text-gray-400" />;
    
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    
    if (diff > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          +{percentage}%
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <TrendingDown className="w-4 h-4 mr-1" />
          {percentage}%
        </span>
      );
    }
    
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Posição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Canal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Total de Views
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Inscritos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Vídeos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Variação
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {channels.map((channel, index) => {
            const prevStats = previousStats?.[channel.id];
            
            return (
              <tr key={channel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/channel/${channel.id}`} className="flex items-center hover:opacity-80 transition-opacity">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      {channel.thumbnailUrl ? (
                        <Image
                          src={channel.thumbnailUrl}
                          alt={channel.title}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {channel.title}
                      </div>
                      {channel.customUrl && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{channel.customUrl}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {channel.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(channel.viewCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(channel.subscriberCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(channel.videoCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getGrowthIndicator(channel.viewCount, prevStats?.viewCount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {channels.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Nenhum canal encontrado. Adicione canais para começar!
        </div>
      )}
    </div>
  );
}

