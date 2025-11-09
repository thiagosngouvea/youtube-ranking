'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Channel, ChannelStats } from '@/lib/db';
import { formatNumber, formatDate } from '@/lib/utils';
import StatsChart from '@/components/StatsChart';
import Loading from '@/components/Loading';
import ChannelGroupManager from '@/components/ChannelGroupManager';
import { ArrowLeft, ExternalLink, Users, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [stats, setStats] = useState<ChannelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [secondaryChannels, setSecondaryChannels] = useState<Channel[]>([]);

  useEffect(() => {
    fetchChannelData();
  }, [channelId]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      
      // Fetch channel details
      const { data: channelsData } = await axios.get('/api/channels');
      const channelData = channelsData.channels.find((c: Channel) => c.id === channelId);
      setAllChannels(channelsData.channels);
      
      if (channelData) {
        setChannel(channelData);
        
        // Fetch secondary channels if this is a primary channel
        if (channelData.secondaryChannelIds && channelData.secondaryChannelIds.length > 0) {
          const secondaries = channelsData.channels.filter((c: Channel) =>
            channelData.secondaryChannelIds?.includes(c.id)
          );
          setSecondaryChannels(secondaries);
        }
      }
      
      // Fetch stats
      const { data: statsData } = await axios.get(`/api/stats/${channelId}`);
      setStats(statsData.stats || []);
    } catch (error) {
      console.error('Error fetching channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecondary = async (secondaryChannelId: string, groupName?: string) => {
    try {
      await axios.post('/api/channels/group/add', {
        primaryChannelId: channelId,
        secondaryChannelId,
        groupName,
      });
      await fetchChannelData();
    } catch (error) {
      throw new Error('Erro ao adicionar canal secundário');
    }
  };

  const handleRemoveSecondary = async (secondaryChannelId: string) => {
    try {
      await axios.post('/api/channels/group/remove', {
        primaryChannelId: channelId,
        secondaryChannelId,
      });
      await fetchChannelData();
    } catch (error) {
      throw new Error('Erro ao remover canal secundário');
    }
  };

  const handleUpdateChannel = async () => {
    if (updating) return;
    
    setUpdating(true);
    try {
      await axios.post('/api/channels/update', {
        channelId: channelId,
      });
      
      // Recarregar dados após atualização
      await fetchChannelData();
      
      alert('✅ Canal atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating channel:', error);
      alert('❌ Erro ao atualizar canal');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loading message="Carregando canal..." />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Canal não encontrado
          </h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar para o ranking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Ranking
          </button>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {channel.thumbnailUrl && (
                <Image
                  src={channel.thumbnailUrl}
                  alt={channel.title}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {channel.title}
                </h1>
                {channel.groupName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    🏷️ {channel.groupName}
                  </p>
                )}
                {channel.customUrl && (
                  <a
                    href={`https://youtube.com/@${channel.customUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-2"
                  >
                    @{channel.customUrl}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex items-center gap-3">
              {/* Botão Atualizar Canal */}
              <button
                onClick={handleUpdateChannel}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Atualizar dados deste canal"
              >
                <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                {updating ? 'Atualizando...' : 'Atualizar Canal'}
              </button>

              {/* Botão Gerenciar Grupo - apenas para canais principais */}
              {channel.category === 'principal' && (
                <button
                  onClick={() => setShowGroupManager(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Gerenciar Grupo
                  {secondaryChannels.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                      {secondaryChannels.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total de Views
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(channel.viewCount)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Inscritos
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(channel.subscriberCount)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total de Vídeos
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(channel.videoCount)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Categoria
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {channel.category}
            </div>
          </div>
        </div>

        {/* Description */}
        {channel.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Sobre o Canal
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {channel.description}
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Criado em: {formatDate(channel.publishedAt)}
            </div>
          </div>
        )}

        {/* Charts */}
        {stats.length > 0 && (
          <div className="space-y-8">
            <StatsChart
              stats={stats}
              dataKey="viewCount"
              title="Evolução de Views"
              color="#3b82f6"
            />
            
            <StatsChart
              stats={stats}
              dataKey="subscriberCount"
              title="Evolução de Inscritos"
              color="#10b981"
            />
            
            <StatsChart
              stats={stats}
              dataKey="videosLast30Days"
              title="Vídeos Publicados (últimos 30 dias)"
              color="#f59e0b"
            />
          </div>
        )}

        {stats.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma estatística histórica disponível ainda.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              As estatísticas serão coletadas após cada atualização.
            </p>
          </div>
        )}
      </main>

      {/* Modal de Gerenciamento de Grupo */}
      {showGroupManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full">
            <ChannelGroupManager
              primaryChannel={channel}
              secondaryChannels={secondaryChannels}
              allChannels={allChannels}
              onAddSecondary={handleAddSecondary}
              onRemoveSecondary={handleRemoveSecondary}
              onClose={() => setShowGroupManager(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

