import React from 'react';
import { ComicPanel as ComicPanelType } from '../types';
import { ImageIcon, Loader2, Edit2, ArrowLeft, ArrowRight } from 'lucide-react';

interface ComicPanelProps {
  panel: ComicPanelType;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (panel: ComicPanelType) => void;
  onMove: (index: number, direction: 'left' | 'right') => void;
}

const ComicPanel: React.FC<ComicPanelProps> = ({ 
  panel, 
  index, 
  isFirst, 
  isLast,
  onEdit, 
  onMove 
}) => {
  // Determine grid span based on layout type
  const getGridClass = () => {
    switch (panel.layout) {
      case 'wide': return 'col-span-1 md:col-span-2 aspect-[2/1]';
      case 'tall': return 'col-span-1 row-span-2 aspect-[1/2]';
      case 'square': default: return 'col-span-1 aspect-square';
    }
  };

  return (
    <div className={`relative group bg-white p-2 md:p-3 shadow-xl rounded-sm border-2 border-gray-900 ${getGridClass()} overflow-hidden`}>
      {/* Action Overlay */}
      <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-4 pointer-events-none">
         <div className="flex space-x-2 pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             <button 
               onClick={() => onEdit(panel)}
               className="bg-white text-gray-900 p-3 rounded-full hover:bg-indigo-100 hover:text-indigo-700 shadow-lg font-bold transition-colors"
               title="Edit Panel"
             >
               <Edit2 className="w-5 h-5" />
             </button>
         </div>
         
         <div className="flex space-x-12 pointer-events-auto text-white">
            {!isFirst && (
                <button onClick={() => onMove(index, 'left')} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Move Back">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            )}
            {!isLast && (
                <button onClick={() => onMove(index, 'right')} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Move Forward">
                    <ArrowRight className="w-6 h-6" />
                </button>
            )}
         </div>
      </div>

      {/* Main Image Container */}
      <div className="w-full h-full relative bg-gray-100 border-2 border-black overflow-hidden flex items-center justify-center">
        {panel.imageUrl ? (
          <img 
            src={panel.imageUrl} 
            alt={panel.description}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400 p-4 text-center">
            {panel.isGenerating ? (
              <Loader2 className="w-12 h-12 animate-spin mb-2 text-indigo-600" />
            ) : (
              <ImageIcon className="w-12 h-12 mb-2" />
            )}
            <p className="text-xs md:text-sm font-mono">{panel.isGenerating ? "Drawing..." : "Waiting..."}</p>
          </div>
        )}
        
        {/* Sound Effect (SFX) */}
        {panel.soundEffect && panel.soundEffect !== "N/A" && (
            <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <p className="font-comic-header text-4xl md:text-6xl text-red-600 font-bold tracking-widest -rotate-12 drop-shadow-[3px_3px_0px_rgba(255,255,255,1)]" style={{ WebkitTextStroke: '2px black' }}>
                    {panel.soundEffect}
                </p>
            </div>
        )}

        {/* Caption Box */}
        {panel.caption && panel.caption !== "N/A" && (
          <div className="absolute top-0 left-0 p-3 max-w-[80%] z-10 pointer-events-none">
             <div className="bg-yellow-100 border-2 border-black px-3 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] transform -rotate-1">
               <p className="font-comic-body text-xs md:text-sm font-bold text-black uppercase leading-tight">
                 {panel.caption}
               </p>
             </div>
          </div>
        )}

        {/* Dialogue Bubble */}
        {panel.dialogue && panel.dialogue !== "N/A" && (
          <div className="absolute bottom-4 right-4 max-w-[70%] z-10 pointer-events-none">
            <div className="bg-white border-2 border-black rounded-[50%] px-4 py-3 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <p className="font-comic-body text-xs md:text-sm text-center text-black leading-tight">
                {panel.dialogue}
              </p>
              {/* Little triangle for speech bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Number Badge */}
      <div className="absolute top-full -mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-b-md">
        #{index + 1}
      </div>
    </div>
  );
};

export default ComicPanel;
