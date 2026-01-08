import React, { useState } from 'react';
import { StoryAnalysis, Character } from '../types';
import { Wand2, User, ScrollText, Lightbulb, PlayCircle, Edit3, ArrowRight, Sparkles } from 'lucide-react';

interface StoryAnalysisViewProps {
  analysis: StoryAnalysis;
  onConfirm: (characters: Character[]) => void;
  onCancel: () => void;
}

const StoryAnalysisView: React.FC<StoryAnalysisViewProps> = ({ analysis, onConfirm, onCancel }) => {
  const [characters, setCharacters] = useState<Character[]>(analysis.characters);

  const handleCharacterChange = (index: number, newDescription: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], description: newDescription };
    setCharacters(updated);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-comic-header text-white mb-2 flex items-center justify-center">
            <Sparkles className="w-6 h-6 mr-3 text-yellow-400" />
            AI Story Analysis
            <Sparkles className="w-6 h-6 ml-3 text-yellow-400" />
        </h2>
        <p className="text-gray-400">Review the AI's plan before generating your comic. Accurate characters mean better images.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overview Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center">
                <ScrollText className="w-5 h-5 mr-2" />
                Story Overview
            </h3>
            <div className="space-y-4">
                <div>
                    <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">Genre</span>
                    <p className="text-white text-lg font-comic-body">{analysis.genre}</p>
                </div>
                <div>
                    <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">Tone</span>
                    <p className="text-white text-lg font-comic-body">{analysis.tone}</p>
                </div>
            </div>
        </div>

        {/* Feedback Card */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Lightbulb className="w-24 h-24 text-yellow-500" />
             </div>
             <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center relative z-10">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI Creative Coach
            </h3>
            <p className="text-gray-200 leading-relaxed relative z-10 italic">
                "{analysis.feedback}"
            </p>
        </div>
      </div>

      {/* Characters Section */}
      <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="w-6 h-6 mr-2 text-green-400" />
              Character Consistency Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-green-500/50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white text-lg">{char.name}</h4>
                          <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-green-400" />
                      </div>
                      <textarea
                        value={char.description}
                        onChange={(e) => handleCharacterChange(index, e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-sm text-gray-300 focus:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
                        rows={3}
                      />
                  </div>
              ))}
              {characters.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-gray-800/50 rounded-lg border border-dashed border-gray-700 text-gray-500">
                      No specific characters detected. The AI will generate generic characters based on the story context.
                  </div>
              )}
          </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 border-t border-gray-800 pt-6">
          <button 
            onClick={onCancel}
            className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
          >
              Back to Edit
          </button>
          <button 
            onClick={() => onConfirm(characters)}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-bold shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-0.5 transition-all flex items-center"
          >
              <Wand2 className="w-5 h-5 mr-2" />
              Generate Comic Pages
              <ArrowRight className="w-5 h-5 ml-2 opacity-60" />
          </button>
      </div>

    </div>
  );
};

export default StoryAnalysisView;