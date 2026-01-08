import React, { useState, useCallback } from 'react';
import StoryForm from './components/StoryForm';
import StoryAnalysisView from './components/StoryAnalysisView';
import ComicBook from './components/ComicBook';
import { generateComicScript, generatePanelImage, refinePanelImage, analyzeStory } from './services/geminiService';
import { ComicPanel as ComicPanelType, ComicStyle, AppState, StoryAnalysis, Character } from './types';
import { Zap } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [panels, setPanels] = useState<ComicPanelType[]>([]);
  const [currentStyle, setCurrentStyle] = useState<ComicStyle | null>(null);
  const [currentStory, setCurrentStory] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<StoryAnalysis | null>(null);
  const [storyTitle, setStoryTitle] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (story: string, style: ComicStyle) => {
      try {
          setAppState(AppState.ANALYZING_STORY);
          setErrorMsg(null);
          setCurrentStory(story);
          setCurrentStyle(style);
          setStoryTitle(story.split('.')[0] || "My Comic");

          const analysis = await analyzeStory(story);
          setAnalysisData(analysis);
          setAppState(AppState.REVIEW_ANALYSIS);

      } catch (err) {
          console.error("Analysis failed", err);
          setErrorMsg("Could not analyze story. Please check API key or try again.");
          setAppState(AppState.ERROR);
      }
  }, []);

  const handleGenerate = useCallback(async (characters: Character[]) => {
    if (!currentStyle || !currentStory) return;

    try {
      setAppState(AppState.GENERATING_SCRIPT);
      
      // 1. Generate Script using refined characters
      const script = await generateComicScript(currentStory, characters);
      
      // Initialize panels with loading state
      const initialPanels: ComicPanelType[] = script.panels.map((p, i) => ({
        id: Date.now() + i, // Unique ID better than index for reordering
        description: p.description,
        dialogue: p.dialogue,
        caption: p.caption,
        soundEffect: p.soundEffect,
        layout: p.layout,
        isGenerating: true,
      }));

      setPanels(initialPanels);
      setAppState(AppState.GENERATING_IMAGES);

      // 2. Generate Images Sequentially
      const imagePromises = initialPanels.map(async (panel) => {
        try {
          const imageUrl = await generatePanelImage(panel.description, currentStyle.promptModifier);
          
          setPanels(prev => prev.map(p => {
            if (p.id === panel.id) {
              return { ...p, imageUrl, isGenerating: false };
            }
            return p;
          }));
        } catch (err) {
            console.error(`Failed to generate image for panel ${panel.id}`, err);
            setPanels(prev => prev.map(p => {
                if (p.id === panel.id) {
                  return { ...p, isGenerating: false }; 
                }
                return p;
              }));
        }
      });

      await Promise.all(imagePromises);
      setAppState(AppState.COMPLETE);

    } catch (err) {
      console.error("Error in generation flow:", err);
      setErrorMsg("Something went wrong while creating your comic. Please check your API key and try again.");
      setAppState(AppState.ERROR);
    }
  }, [currentStory, currentStyle]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setPanels([]);
    setCurrentStyle(null);
    setAnalysisData(null);
    setErrorMsg(null);
  };

  const handleUpdatePanel = (id: number, updates: Partial<ComicPanelType>) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleRegeneratePanel = async (id: number, newDescription: string) => {
    if (!currentStyle) return;
    
    // Set loading state
    setPanels(prev => prev.map(p => p.id === id ? { ...p, isGenerating: true, description: newDescription } : p));

    try {
        const imageUrl = await generatePanelImage(newDescription, currentStyle.promptModifier);
        setPanels(prev => prev.map(p => p.id === id ? { ...p, imageUrl, isGenerating: false } : p));
    } catch (err) {
        console.error(`Failed to regenerate image for panel ${id}`, err);
        setPanels(prev => prev.map(p => p.id === id ? { ...p, isGenerating: false } : p));
    }
  };

  const handleRefinePanel = async (id: number, instruction: string) => {
      const panel = panels.find(p => p.id === id);
      if (!panel || !panel.imageUrl) return;

      setPanels(prev => prev.map(p => p.id === id ? { ...p, isGenerating: true } : p));

      try {
          const imageUrl = await refinePanelImage(panel.imageUrl, instruction);
          setPanels(prev => prev.map(p => p.id === id ? { ...p, imageUrl, isGenerating: false } : p));
      } catch (err) {
          console.error(`Failed to refine image for panel ${id}`, err);
          // Revert loading state
          setPanels(prev => prev.map(p => p.id === id ? { ...p, isGenerating: false } : p));
      }
  };

  const handleMovePanel = (index: number, direction: 'left' | 'right') => {
      setPanels(prev => {
          const newPanels = [...prev];
          if (direction === 'left' && index > 0) {
              [newPanels[index], newPanels[index - 1]] = [newPanels[index - 1], newPanels[index]];
          } else if (direction === 'right' && index < newPanels.length - 1) {
              [newPanels[index], newPanels[index + 1]] = [newPanels[index + 1], newPanels[index]];
          }
          return newPanels;
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold font-comic-header tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              InkSpire AI
            </span>
          </div>
          {appState !== AppState.IDLE && (
            <div className="text-xs font-mono text-gray-500">
                {appState === AppState.ANALYZING_STORY && "READING STORY..."}
                {appState === AppState.REVIEW_ANALYSIS && "PLANNING PHASE"}
                {appState === AppState.GENERATING_SCRIPT && "WRITING SCRIPT..."}
                {appState === AppState.GENERATING_IMAGES && "INKING PANELS..."}
                {appState === AppState.COMPLETE && "COMPLETE"}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        
        {errorMsg && (
            <div className="w-full max-w-2xl mb-8 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center">
                {errorMsg}
                <button onClick={() => setAppState(AppState.IDLE)} className="ml-4 underline hover:text-white">Try Again</button>
            </div>
        )}

        {appState === AppState.IDLE && (
           <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-12 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 font-comic-header text-white leading-tight">
                  Turn Your Words Into <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Visual Masterpieces
                  </span>
                </h1>
                <p className="text-lg text-gray-400">
                  Describe a scene, choose a style, or upload a reference image, and watch as AI generates a professional comic book page.
                </p>
              </div>
              <StoryForm onAnalyze={handleAnalyze} isProcessing={false} />
           </div>
        )}

        {appState === AppState.REVIEW_ANALYSIS && analysisData && (
             <StoryAnalysisView 
                analysis={analysisData}
                onConfirm={handleGenerate}
                onCancel={() => setAppState(AppState.IDLE)}
             />
        )}

        {(appState === AppState.GENERATING_SCRIPT || appState === AppState.GENERATING_IMAGES || appState === AppState.COMPLETE) && (
          <ComicBook 
            panels={panels} 
            style={currentStyle} 
            title={storyTitle}
            onReset={handleReset}
            onUpdatePanel={handleUpdatePanel}
            onRegeneratePanel={handleRegeneratePanel}
            onRefinePanel={handleRefinePanel}
            onMovePanel={handleMovePanel}
          />
        )}
        
        {appState === AppState.ANALYZING_STORY && (
            <div className="flex flex-col items-center justify-center space-y-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                 <p className="text-indigo-400 font-mono animate-pulse">Analyzing narrative structure...</p>
            </div>
        )}

      </main>

      <footer className="border-t border-gray-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} InkSpire AI. Powered by Gol Media. Developed by Surya Prakash Garige.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;