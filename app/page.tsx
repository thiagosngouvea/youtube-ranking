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
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredChannels(channels);
    } else {
      setFilteredChannels(channels.filter(c => c.category === selectedCategory));
    }
  }, [selectedCategory, channels]);

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
      await axios.post('/api/channels/add', { channelId, category });
      await fetchChannels();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao adicionar canal');
    }
  };

  const handleUpdateAll = async () => {
    if (updating) return;
    
    try {
      setUpdating(true);
      await axios.post('/api/channels/update', {});
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Export */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

          {filteredChannels.length > 0 && (
            <ExportButtons channels={filteredChannels} />
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

