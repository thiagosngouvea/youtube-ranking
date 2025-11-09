'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Channel } from '@/lib/db';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, Flame, Calendar, Clock, ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Loading from '@/components/Loading';

interface VideoInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  videoType: 'normal' | 'shorts' | 'live';
}

interface PeriodChannel extends Channel {
  periodViews: number;
  periodVideos: number;
  periodLikes: number;
  periodComments: number;
  engagementRate: number;
  videos: VideoInfo[];
}

const PERIODS = [
  { value: '1', label: 'Hoje', icon: Clock },
  { value: '7', label: 'Últimos 7 dias', icon: Calendar },
  { value: '14', label: 'Últimos 14 dias', icon: Calendar },
  { value: '30', label: 'Últimos 30 dias', icon: Calendar },
];

const VIDEO_TYPES = [
  { value: 'all', label: 'Todos', icon: '📺' },
  { value: 'normal', label: 'Vídeos Normais (≥5min)', icon: '🎬' },
  { value: 'shorts', label: 'Shorts (<5min)', icon: '📱' },
  { value: 'live', label: 'Lives', icon: '🔴' },
];

export default function TrendingPage() {
  const [ranking, setRanking] = useState<PeriodChannel[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRanking();
  }, [selectedPeriod, selectedType]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const typeParam = selectedType !== 'all' ? `&type=${selectedType}` : '';
      const { data } = await axios.get(`/api/ranking/period?period=${selectedPeriod}${typeParam}`);
      setRanking(data.ranking || []);
      setHasData(data.ranking && data.ranking.length > 0 && data.ranking.some((c: PeriodChannel) => c.periodViews > 0));
    } catch (error) {
      console.error('Error fetching trending ranking:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const period = PERIODS.find(p => p.value === selectedPeriod);
    return period?.label || 'Últimos 30 dias';
  };

  const toggleRow = (channelId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(channelId)) {
      newExpanded.delete(channelId);
    } else {
      newExpanded.add(channelId);
    }
    setExpandedRows(newExpanded);
  };

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case 'shorts': return '📱';
      case 'live': return '🔴';
      default: return '🎬';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Ranking Geral
          </Link>
          
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Trending - Mais Visualizados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Canais com mais visualizações por período
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-6">
          {/* Period Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecione o Período
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PERIODS.map((period) => {
                const Icon = period.icon;
                return (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      selectedPeriod === period.value
                        ? 'bg-orange-600 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {period.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Vídeo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {VIDEO_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedType === type.value
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* No Data Warning */}
        {!loading && !hasData && (
          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-yellow-600 dark:text-yellow-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Nenhum Dado Disponível
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  Não há vídeos no banco de dados ainda. Para ver o ranking por período, você precisa:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-yellow-700 dark:text-yellow-300 mb-4">
                  <li><strong>Configurar a API do YouTube</strong> no arquivo .env.local</li>
                  <li><strong>Adicionar canais</strong> na página inicial</li>
                  <li><strong>Clicar em "Atualizar Dados"</strong> para buscar os vídeos</li>
                </ol>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Ir para Página Principal
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {!loading && hasData && ranking.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Views ({getPeriodLabel()})
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(ranking.reduce((sum, c) => sum + c.periodViews, 0))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Vídeos Publicados
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(ranking.reduce((sum, c) => sum + c.periodVideos, 0))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Canal Mais Quente 🔥
              </div>
              <div className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {ranking[0]?.title || '-'}
              </div>
            </div>
          </div>
        )}

        {/* Ranking Table */}
        {loading ? (
          <Loading message="Carregando ranking..." />
        ) : hasData ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-orange-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Canal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Views ({getPeriodLabel()})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vídeos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Engajamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Média Views/Vídeo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ranking.map((channel, index) => {
                    const avgViewsPerVideo = channel.periodVideos > 0 
                      ? channel.periodViews / channel.periodVideos 
                      : 0;
                    const isExpanded = expandedRows.has(channel.id);
                    
                    return (
                      <React.Fragment key={channel.id}>
                      <tr 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index < 3 ? 'bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRow(channel.id)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title={isExpanded ? 'Recolher vídeos' : 'Expandir vídeos'}
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              #{index + 1}
                            </span>
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/channel/${channel.id}`}
                            className="flex items-center hover:opacity-80 transition-opacity"
                          >
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
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {channel.category}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            {formatNumber(channel.periodViews)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {channel.periodVideos} vídeos
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {channel.engagementRate.toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ({formatNumber(channel.periodLikes)} 👍 + {formatNumber(channel.periodComments)} 💬)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatNumber(Math.round(avgViewsPerVideo))}
                        </td>
                      </tr>
                      {/* Expanded Row - Videos List */}
                      {isExpanded && channel.videos && channel.videos.length > 0 && (
                        <tr className="bg-gray-50 dark:bg-gray-900">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                📹 Vídeos do período ({channel.videos.length})
                              </div>
                              <div className="grid gap-3 max-h-96 overflow-y-auto">
                                {channel.videos
                                  .sort((a, b) => b.viewCount - a.viewCount)
                                  .map((video) => (
                                  <div 
                                    key={video.id}
                                    className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-md transition-shadow"
                                  >
                                    {/* Thumbnail */}
                                    <a 
                                      href={`https://youtube.com/watch?v=${video.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-shrink-0"
                                    >
                                      {video.thumbnailUrl ? (
                                        <Image
                                          src={video.thumbnailUrl}
                                          alt={video.title}
                                          width={120}
                                          height={68}
                                          className="rounded object-cover"
                                        />
                                      ) : (
                                        <div className="w-[120px] h-[68px] bg-gray-200 dark:bg-gray-700 rounded" />
                                      )}
                                    </a>
                                    
                                    {/* Video Info */}
                                    <div className="flex-1 min-w-0">
                                      <a 
                                        href={`https://youtube.com/watch?v=${video.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 flex items-start gap-1"
                                      >
                                        <span className="text-base" title={video.videoType}>
                                          {getVideoTypeIcon(video.videoType)}
                                        </span>
                                        {video.title}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0 mt-1" />
                                      </a>
                                      
                                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                          👁️ {formatNumber(video.viewCount)} views
                                        </span>
                                        <span className="flex items-center gap-1">
                                          👍 {formatNumber(video.likeCount)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          💬 {formatNumber(video.commentCount)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          📅 {formatDate(video.publishedAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {ranking.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Nenhum dado disponível para este período. 
                <br />
                Execute "Atualizar Dados" no ranking geral primeiro!
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

