import React from 'react';
import { GeneratedVideo } from '../types';
import { Download, Clock, Maximize2 } from 'lucide-react';

interface VideoCardProps {
  video: GeneratedVideo;
  onDownload: (url: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  return (
    <div className="bg-gray-850 rounded-xl overflow-hidden shadow-lg border border-gray-750 group hover:border-indigo-500 transition-all duration-300">
      <div className="relative aspect-video bg-black">
        <video 
          src={video.url} 
          controls 
          className="w-full h-full object-contain"
          loop
          playsInline
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white flex items-center gap-1">
          <Clock size={12} />
          <span>{new Date(video.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{video.style}</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{video.resolution}</span>
        </div>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-4 h-10" title={video.prompt}>
          {video.prompt || "Image-to-Video Animation"}
        </p>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onDownload(video.url)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Download
          </button>
          <button 
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            title="Expand"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};