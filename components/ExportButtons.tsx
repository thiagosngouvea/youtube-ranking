'use client';

import { Channel } from '@/lib/db';
import { Download, FileText } from 'lucide-react';
import { CSVLink } from 'react-csv';

interface ExportButtonsProps {
  channels: Channel[];
}

export default function ExportButtons({ channels }: ExportButtonsProps) {
  const csvData = channels.map((channel, index) => ({
    Posição: index + 1,
    Canal: channel.title,
    Categoria: channel.category,
    'Total de Views': channel.viewCount,
    Inscritos: channel.subscriberCount,
    'Número de Vídeos': channel.videoCount,
    'URL Customizada': channel.customUrl || '',
  }));

  const csvHeaders = [
    { label: 'Posição', key: 'Posição' },
    { label: 'Canal', key: 'Canal' },
    { label: 'Categoria', key: 'Categoria' },
    { label: 'Total de Views', key: 'Total de Views' },
    { label: 'Inscritos', key: 'Inscritos' },
    { label: 'Número de Vídeos', key: 'Número de Vídeos' },
    { label: 'URL Customizada', key: 'URL Customizada' },
  ];

  // Type assertion para resolver incompatibilidade de tipos com React 18
  const CSVLinkComponent = CSVLink as any;

  return (
    <div className="flex gap-3">
      <CSVLinkComponent
        data={csvData}
        headers={csvHeaders}
        filename={`podcast-ranking-${new Date().toISOString().split('T')[0]}.csv`}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Exportar CSV
      </CSVLinkComponent>
      
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Imprimir
      </button>
    </div>
  );
}

