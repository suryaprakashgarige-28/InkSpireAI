import React, { useRef, useEffect, useState } from 'react';
import { ComicPanel as ComicPanelType, ComicStyle } from '../types';
import ComicPanel from './ComicPanel';
import EditPanelModal from './EditPanelModal';
import { Download, RefreshCw } from 'lucide-react';

interface ComicBookProps {
  panels: ComicPanelType[];
  style: ComicStyle | null;
  title?: string;
  onReset: () => void;
  onUpdatePanel: (id: number, updates: Partial<ComicPanelType>) => void;
  onRegeneratePanel: (id: number, newDescription: string) => void;
  onRefinePanel: (id: number, instruction: string) => void;
  onMovePanel: (index: number, direction: 'left' | 'right') => void;
}

const ComicBook: React.FC<ComicBookProps> = ({ 
  panels, 
  style, 
  title = "Untitled Story", 
  onReset,
  onUpdatePanel,
  onRegeneratePanel,
  onRefinePanel,
  onMovePanel
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingPanel, setEditingPanel] = useState<ComicPanelType | null>(null);

  // Auto scroll to bottom as panels generate
  useEffect(() => {
    if (scrollRef.current) {
        // Optional: Smooth scroll logic if desired
    }
  }, [panels]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6 px-4">
        <button 
          onClick={onReset}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Create New
        </button>
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl text-white font-comic-header tracking-wider uppercase drop-shadow-lg">
                {title.slice(0, 30)}{title.length > 30 ? '...' : ''}
            </h1>
            <span className="text-sm text-indigo-400 font-medium uppercase tracking-widest">{style?.name || 'Custom'} Edition</span>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Print / PDF
        </button>
      </div>

      {/* Comic Page Container */}
      <div ref={scrollRef} className="flex-grow bg-gray-200 p-2 md:p-8 rounded-sm shadow-2xl overflow-y-auto comic-scroll border-8 border-gray-900">
        <div className="bg-white p-4 md:p-8 min-h-[800px] shadow-inner relative">
          
          {/* Paper Texture Overlay (CSS Pattern) */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-min">
             {panels.map((panel, index) => (
               <ComicPanel 
                  key={panel.id} 
                  panel={panel} 
                  index={index}
                  isFirst={index === 0}
                  isLast={index === panels.length - 1}
                  onEdit={(p) => setEditingPanel(p)}
                  onMove={onMovePanel}
               />
             ))}
          </div>

          <div className="mt-12 text-center">
             <div className="inline-block border-t-2 border-black pt-2">
                <p className="font-comic-body font-bold text-gray-900 uppercase text-xs tracking-[0.2em]">The End</p>
             </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPanel && (
        <EditPanelModal
          panel={editingPanel}
          isOpen={!!editingPanel}
          onClose={() => setEditingPanel(null)}
          onUpdate={onUpdatePanel}
          onRegenerateImage={onRegeneratePanel}
          onRefineImage={onRefinePanel}
        />
      )}
    </div>
  );
};

export default ComicBook;
