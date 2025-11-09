'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Channel } from '@/lib/db';
import { CATEGORIES } from '@/lib/utils';
import RankingTable from '@/components/RankingTable';
import AddChannelModal from '@/components/AddChannelModal';
import ExportButtons from '@/components/ExportButtons';
import StatsCards from '@/components/StatsCards';
import Loading from '@/components/Loading';
import AuthButton from '@/components/AuthButton';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useAuthAxios } from '@/lib/use-auth-axios';

export default function Home() {
  const { isAdmin } = useAuth();
  const authAxios = useAuthAxios();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [channelView, setChannelView] = useState<'all' | 'principal' | 'cortes_outros'>('principal'); // Filtro por categoria
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    let filtered = channels;
    
    // Filtrar por categoria (novo sistema combinado)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    
    // Filtrar por visualização (principal vs cortes+outros)
    if (channelView === 'principal') {
      filtered = filtered.filter(c => c.category === 'principal');
    } else if (channelView === 'cortes_outros') {
      filtered = filtered.filter(c => c.category === 'cortes' || c.category === 'outros');
    }
    // 'all' mostra todos os canais
    
    setFilteredChannels(filtered);
  }, [selectedCategory, channelView, channels]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/channels');
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async (channelId: string, category: string) => {
    try {
      await authAxios({
        method: 'POST',
        url: '/api/channels/add',
        data: { channelId, category }
      });
      await fetchChannels();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao adicionar canal');
    }
  };

  const handleUpdateAll = async () => {
    if (updating) return;
    
    try {
      setUpdating(true);
      await authAxios({
        method: 'POST',
        url: '/api/channels/update',
        data: {}
      });
      await fetchChannels();
    } catch (error) {
      console.error('Error updating channels:', error);
      alert('Erro ao atualizar canais. Verifique o console para mais detalhes.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                YouTube Podcast Ranking
              </h1>
            </div>
            <div className="flex gap-3">
              <Link
                href="/trending"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </Link>
              
              {/* Botões Admin - apenas para usuários autenticados */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Canal
                  </button>
                  <button
                    onClick={handleUpdateAll}
                    disabled={updating || channels.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                    {updating ? 'Atualizando...' : 'Atualizar Dados'}
                  </button>
                </>
              )}
              
              {/* Botão de Auth */}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Export */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro por Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtrar por Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Tipo de Canal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visualização
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChannelView('principal')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channelView === 'principal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    📌 Principal
                  </button>
                  <button
                    onClick={() => setChannelView('cortes_outros')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channelView === 'cortes_outros'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    ✂️ Cortes + Outros
                  </button>
                  <button
                    onClick={() => setChannelView('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channelView === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    📺 Todos
                  </button>
                </div>
              </div>
            </div>

            {filteredChannels.length > 0 && (
              <ExportButtons channels={filteredChannels} />
            )}
          </div>

          {/* Info sobre filtro ativo */}
          {channelView === 'cortes_outros' && filteredChannels.length === 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
              💡 Nenhum canal de cortes ou outros encontrado. Adicione canais com a categoria "Cortes" ou "Outros".
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {!loading && channels.length > 0 && (
          <div className="mb-6">
            <StatsCards channels={filteredChannels} />
          </div>
        )}

        {/* Ranking Table */}
        {loading ? (
          <Loading message="Carregando canais..." />
        ) : (
          <RankingTable channels={filteredChannels} />
        )}
      </main>

      {/* Add Channel Modal */}
      <AddChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddChannel}
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header button,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

