'use client';

import { Channel } from '@/lib/db';
import { formatNumber } from '@/lib/utils';
import { Users, Eye, Video, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  channels: Channel[];
}

export default function StatsCards({ channels }: StatsCardsProps) {
  const totalChannels = channels.length;
  const totalSubscribers = channels.reduce((sum, c) => sum + c.subscriberCount, 0);
  const totalViews = channels.reduce((sum, c) => sum + c.viewCount, 0);
  const totalVideos = channels.reduce((sum, c) => sum + c.videoCount, 0);
  
  const avgEngagement = channels.length > 0
    ? totalViews / totalVideos / channels.length
    : 0;

  const stats = [
    {
      title: 'Total de Canais',
      value: totalChannels,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Total de Inscritos',
      value: formatNumber(totalSubscribers),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Total de Views',
      value: formatNumber(totalViews),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Total de Vídeos',
      value: formatNumber(totalVideos),
      icon: Video,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

