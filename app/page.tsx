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
import { Plus, RefreshCw, TrendingUp, Flame } from 'lucide-react';
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
              
              <Link
                href="/viral"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors"
              >
                <Flame className="w-4 h-4" />
                Virais
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
              💡 Nenhum canal de cortes ou outros encontrado. Adicione canais com a categoria &quot;Cortes&quot; ou &quot;Outros&quot;.
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

      {/* Support Section / Apoio ao Projeto */}
      <footer className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                💜 Apoie este Projeto
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Este é um projeto open-source mantido com dedicação. Seu apoio ajuda a mantê-lo funcionando!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PIX / Doações */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Faça uma Doação via PIX
                  </h4>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Chave PIX:</strong>
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-3 border border-green-300 dark:border-green-700">
                    <code className="text-sm text-green-700 dark:text-green-400 flex-1 break-all">
                      thiagonunes026@gmail.com
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('thiagonunes026@gmail.com');
                        alert('✅ Chave PIX copiada!');
                      }}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                      title="Copiar chave PIX"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Contato e Redes */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📬</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Entre em Contato
                  </h4>
                </div>
                <div className="space-y-3">
                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/thiago-gouv%C3%AAa-aa3bb915a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-[#0A66C2] rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        LinkedIn
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Conecte-se comigo
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:thiagonunes026@gmail.com"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📧</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Email
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        thiagonunes026@gmail.com
                      </p>
                    </div>
                  </a>

                  {/* Sugestões */}
                  <a
                    href="mailto:thiagonunes026@gmail.com?subject=Sugestão para YouTube Podcast Ranking"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💡</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Sugestões de Features
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Envie suas ideias
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Desenvolvido com 💜 por <strong>Thiago Gouvêa</strong>
              </p>
            </div>
          </div>
        </div>
      </footer>

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

