import React, { useState } from 'react';
import { ComicPanel } from '../types';
import { X, RefreshCw, Check, MessageSquare, Type, Image, Sparkles, Wand2 } from 'lucide-react';
import { generateSoundEffect } from '../services/geminiService';

interface EditPanelModalProps {
  panel: ComicPanel;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<ComicPanel>) => void;
  onRegenerateImage: (id: number, newDescription: string) => void;
  onRefineImage: (id: number, instruction: string) => void;
}

const EditPanelModal: React.FC<EditPanelModalProps> = ({ 
  panel, 
  isOpen, 
  onClose, 
  onUpdate,
  onRegenerateImage,
  onRefineImage
}) => {
  const [description, setDescription] = useState(panel.description);
  const [dialogue, setDialogue] = useState(panel.dialogue);
  const [caption, setCaption] = useState(panel.caption);
  const [soundEffect, setSoundEffect] = useState(panel.soundEffect || "");
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isGeneratingSFX, setIsGeneratingSFX] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(panel.id, { description, dialogue, caption, soundEffect });
    onClose();
  };

  const handleRegenerate = () => {
    // Save text changes locally first then trigger regen
    onUpdate(panel.id, { description, dialogue, caption, soundEffect });
    onRegenerateImage(panel.id, description);
    onClose();
  };

  const handleRefine = () => {
      if (!refineInstruction.trim()) return;
      onUpdate(panel.id, { description, dialogue, caption, soundEffect });
      onRefineImage(panel.id, refineInstruction);
      onClose();
  };

  const handleAutoSFX = async () => {
      setIsGeneratingSFX(true);
      const sfx = await generateSoundEffect(description);
      setSoundEffect(sfx);
      setIsGeneratingSFX(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <h3 className="text-xl font-bold text-white flex items-center">
            Edit Panel #{panel.id + 1}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* IMAGE SECTION */}
          <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700 pb-2">Image Generation</h4>
              
              {/* Regenerate completely */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-indigo-300">
                  <Image className="w-4 h-4 mr-2" />
                  Regenerate from Description
                </label>
                <div className="flex gap-2">
                    <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="flex-grow bg-gray-900 border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <button 
                    onClick={handleRegenerate}
                    className="w-full text-xs bg-gray-700 hover:bg-indigo-600 hover:text-white text-gray-300 px-3 py-2 rounded-md flex items-center justify-center transition-colors"
                >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Regenerate Entire Image
                </button>
              </div>

              {/* Refine existing */}
              {panel.imageUrl && (
                  <div className="space-y-2 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <label className="flex items-center text-sm font-medium text-pink-300">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Refine Existing Image (AI Edit)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={refineInstruction}
                            onChange={(e) => setRefineInstruction(e.target.value)}
                            placeholder="E.g., Make the character smile, Add rain..."
                            className="flex-grow bg-gray-900 border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-pink-500 text-sm"
                        />
                        <button 
                            onClick={handleRefine}
                            disabled={!refineInstruction.trim()}
                            className="text-xs bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-bold"
                        >
                            Refine
                        </button>
                    </div>
                  </div>
              )}
          </div>

          {/* TEXT SECTION */}
          <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700 pb-2">Text Elements</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dialogue Section */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-green-300">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Dialogue
                    </label>
                    <textarea
                    value={dialogue}
                    onChange={(e) => setDialogue(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-comic-body"
                    />
                </div>

                {/* Caption Section */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-yellow-300">
                    <Type className="w-4 h-4 mr-2" />
                    Caption
                    </label>
                    <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm font-comic-body"
                    />
                </div>

                {/* Sound Effect Section */}
                <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center text-sm font-medium text-red-400">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sound Effect (SFX)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={soundEffect}
                            onChange={(e) => setSoundEffect(e.target.value)}
                            placeholder="POW! BAM! SWISH!"
                            className="flex-grow bg-gray-900 border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-red-500 text-sm font-comic-header tracking-wider uppercase"
                        />
                        <button 
                            onClick={handleAutoSFX}
                            disabled={isGeneratingSFX}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center"
                        >
                            {isGeneratingSFX ? <RefreshCw className="animate-spin w-4 h-4" /> : "Auto-Generate"}
                        </button>
                    </div>
                </div>
              </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPanelModal;
