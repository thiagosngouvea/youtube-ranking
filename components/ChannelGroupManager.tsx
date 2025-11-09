'use client';

import { useState } from 'react';
import { X, Plus, Users, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Channel {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelType: 'primary' | 'secondary';
  groupName?: string;
}

interface SecondaryChannelInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface ChannelGroupManagerProps {
  primaryChannel: Channel;
  secondaryChannels: SecondaryChannelInfo[];
  allChannels: Channel[];
  onAddSecondary: (secondaryChannelId: string, groupName?: string) => Promise<void>;
  onRemoveSecondary: (secondaryChannelId: string) => Promise<void>;
  onClose: () => void;
}

export default function ChannelGroupManager({
  primaryChannel,
  secondaryChannels,
  allChannels,
  onAddSecondary,
  onRemoveSecondary,
  onClose,
}: ChannelGroupManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [groupName, setGroupName] = useState(primaryChannel.groupName || primaryChannel.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtrar apenas canais que podem ser adicionados (não são secundários de outros grupos e não o próprio canal)
  const availableChannels = allChannels.filter(
    ch => 
      ch.id !== primaryChannel.id && 
      ch.channelType === 'primary' &&
      !secondaryChannels.some(sec => sec.id === ch.id)
  );

  const handleAddSecondary = async () => {
    if (!selectedChannelId) {
      setError('Selecione um canal');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAddSecondary(selectedChannelId, groupName);
      setSelectedChannelId('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar canal');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSecondary = async (channelId: string) => {
    if (!confirm('Deseja remover este canal do grupo?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onRemoveSecondary(channelId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover canal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Gerenciar Grupo de Canais
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {groupName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Canal Principal */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
          📌 Canal Principal
        </h3>
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Image
            src={primaryChannel.thumbnailUrl}
            alt={primaryChannel.title}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {primaryChannel.title}
            </p>
          </div>
        </div>
      </div>

      {/* Canais Secundários */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
            🔗 Canais Secundários ({secondaryChannels.length})
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {/* Lista de Canais Secundários */}
        {secondaryChannels.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
            Nenhum canal secundário adicionado ainda
          </div>
        ) : (
          <div className="space-y-2">
            {secondaryChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <Image
                  src={channel.thumbnailUrl}
                  alt={channel.title}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {channel.title}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveSecondary(channel.id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-md transition-colors disabled:opacity-50"
                  title="Remover do grupo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form para Adicionar Canal */}
      {isOpen && (
        <div className="p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-10 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Adicionar Canal Secundário
          </h4>
          
          <div className="space-y-3">
            {/* Nome do Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Grupo
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Flow Podcast Network"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={loading}
              />
            </div>

            {/* Selecionar Canal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selecione o Canal
              </label>
              {availableChannels.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Nenhum canal disponível para adicionar
                </p>
              ) : (
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                >
                  <option value="">-- Selecione um canal --</option>
                  {availableChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedChannelId('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSecondary}
                disabled={loading || !selectedChannelId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adicionando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informação */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
        💡 <strong>Dica:</strong> Canais secundários têm suas métricas somadas ao canal principal nos rankings e visualizações em grupo.
      </div>
    </div>
  );
}

