import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GeneratedVideo, VideoStyle } from '../types';
import { VIDEO_STYLES } from '../constants';

interface StatsDashboardProps {
  videos: GeneratedVideo[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ videos }) => {
  const data = VIDEO_STYLES.map(style => {
    return {
      name: style.name,
      count: videos.filter(v => v.style === style.id).length,
      color: style.previewColor.replace('bg-', '').replace('-500', '') 
    };
  }).filter(d => d.count > 0);

  // Map tailwind color names to hex for Recharts
  const getColor = (colorName: string) => {
    const colors: Record<string, string> = {
      blue: '#3b82f6',
      pink: '#ec4899',
      yellow: '#eab308',
      purple: '#a855f7',
      cyan: '#06b6d4',
      sepia: '#78350f', // Approx brown
    };
    return colors[colorName] || '#6366f1';
  };

  if (data.length === 0) return null;

  return (
    <div className="bg-gray-850 p-6 rounded-xl border border-gray-750 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Generation Statistics</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#f3f4f6' }}
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.color)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};