'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ViralVideo } from '@/lib/db';
import { formatNumber, formatDate } from '@/lib/utils';
import { Flame, TrendingUp, ArrowLeft, Calendar, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Loading from '@/components/Loading';

const PERIODS = [
  { value: '7', label: '7 dias' },
  { value: '14', label: '14 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
  { value: '180', label: '6 meses' },
  { value: '365', label: '1 ano' },
  { value: 'all', label: 'Todo histórico' },
];

const VIDEO_TYPES = [
  { value: 'all', label: 'Todos', icon: '📺' },
  { value: 'normal', label: 'Vídeos Normais', icon: '🎬' },
  { value: 'shorts', label: 'Shorts', icon: '📱' },
];

const VIRAL_LEVELS = {
  diamond: {
    label: 'Diamante',
    icon: '💎',
    color: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
    min: 10,
  },
  gold: {
    label: 'Ouro',
    icon: '🥇',
    color: 'from-yellow-400 to-orange-500',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    min: 5,
  },
  silver: {
    label: 'Prata',
    icon: '🥈',
    color: 'from-gray-400 to-gray-600',
    textColor: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-300 dark:border-gray-700',
    min: 3,
  },
  bronze: {
    label: 'Bronze',
    icon: '🥉',
    color: 'from-orange-400 to-orange-600',
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
    min: 2,
  },
};

export default function ViralPage() {
  const [videos, setVideos] = useState<ViralVideo[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchViralVideos();
  }, [selectedPeriod, selectedType]);

  const fetchViralVideos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/viral?period=${selectedPeriod}&videoType=${selectedType}`);
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching viral videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (videos.length === 0) return { totalViral: 0, avgZScore: 0, topMultiplier: 0 };
    
    const avgZScore = videos.reduce((sum, v) => sum + v.zScore, 0) / videos.length;
    const topMultiplier = Math.max(...videos.map(v => v.multiplier));
    
    return {
      totalViral: videos.length,
      avgZScore: Math.round(avgZScore * 10) / 10,
      topMultiplier: Math.round(topMultiplier * 10) / 10,
    };
  };

  const stats = getStats();

  const getViralLevelInfo = (level: keyof typeof VIRAL_LEVELS) => VIRAL_LEVELS[level];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Ranking Geral
            </Link>
            
            <Link
              href="/trending"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Vídeos Virais
              </h1>
              <p className="text-white/90 mt-1">
                Performance excepcional - muito acima da média do canal
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Período
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-orange-500'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Vídeo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Tipo de Vídeo
            </label>
            <div className="flex flex-wrap gap-2">
              {VIDEO_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-orange-500'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalViral}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vídeos Virais
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgZScore}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Z-Score Médio
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.topMultiplier}x
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Maior Multiplicador
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Vídeos Virais */}
        {loading ? (
          <Loading message="Analisando vídeos virais..." />
        ) : videos.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
            <Flame className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Nenhum vídeo viral encontrado
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Não há vídeos com performance muito acima da média no período selecionado.
              <br />
              Tente ajustar os filtros ou aguarde mais dados serem coletados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video, index) => {
              const levelInfo = getViralLevelInfo(video.viralLevel);
              const isExpanded = expandedVideo === video.id;

              return (
                <div
                  key={video.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${levelInfo.borderColor} shadow-sm overflow-hidden transition-all`}
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Ranking Number */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative group"
                        >
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            width={160}
                            height={90}
                            className="rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-4xl transition-opacity">
                              ▶
                            </span>
                          </div>
                        </a>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {/* Viral Badge */}
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${levelInfo.bgColor} border ${levelInfo.borderColor}`}>
                            <span className="text-lg">{levelInfo.icon}</span>
                            <span className={`text-sm font-bold ${levelInfo.textColor}`}>
                              {levelInfo.label}
                            </span>
                          </div>
                          
                          {/* Video Type */}
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                            {video.videoType === 'shorts' ? '📱 Short' : '🎬 Vídeo'}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {video.title}
                        </h3>

                        <Link
                          href={`/channel/${video.channelId}`}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block mb-2"
                        >
                          {video.channelTitle}
                        </Link>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatNumber(video.viewCount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Multiplicador</p>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              {video.multiplier}x
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Z-Score</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {video.zScore}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Top</p>
                            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                              {video.percentile}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedVideo(isExpanded ? null : video.id)}
                        className="flex-shrink-0 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-lg ${levelInfo.bgColor} border ${levelInfo.borderColor}`}>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Análise Estatística
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Média do canal:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(video.channelAverage)} views
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Este vídeo:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(video.viewCount)} views
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Diferença:</span>
                                <span className="font-semibold text-orange-600 dark:text-orange-400">
                                  +{formatNumber(video.viewCount - video.channelAverage)} views
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400">Desvios padrão:</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                  {video.zScore} σ
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Engajamento
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">👍 Likes:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(video.likeCount)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">💬 Comentários:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(video.commentCount)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">📅 Publicado:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatDate(video.publishedAt)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400">Taxa de likes:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {((video.likeCount / video.viewCount) * 100).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            <span>▶</span>
                            Assistir no YouTube
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            💡 Como funciona o Viral Score?
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <p>
              <strong>Z-Score:</strong> Medida estatística que indica quantos desvios padrão um vídeo está acima da média do canal.
            </p>
            <p>
              <strong>Níveis:</strong> 🥉 Bronze (2-3σ) • 🥈 Prata (3-5σ) • 🥇 Ouro (5-10σ) • 💎 Diamante (10+σ)
            </p>
            <p>
              <strong>Multiplicador:</strong> Quantas vezes mais views que a média do canal o vídeo recebeu.
            </p>
            <p className="pt-2 border-t border-blue-300 dark:border-blue-700">
              Um Z-score de 2 significa que o vídeo performou melhor que 97.7% dos vídeos do canal!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

