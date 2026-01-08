import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, Wand2, Upload, Image as ImageIcon, Mic, MicOff, Pencil } from 'lucide-react';
import { COMIC_STYLES, MOCK_STORY } from '../constants';
import { ComicStyle } from '../types';
import { analyzeImageStyle } from '../services/geminiService';

interface StoryFormProps {
  onAnalyze: (story: string, style: ComicStyle) => void;
  isProcessing: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onAnalyze, isProcessing }) => {
  const [story, setStory] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>(COMIC_STYLES[0].id);
  const [customStyle, setCustomStyle] = useState<ComicStyle | null>(null);
  const [customTextStyle, setCustomTextStyle] = useState('');
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 setStory(prev => prev + (prev ? ' ' : '') + finalTranscript);
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
             // Automatically restart if supposed to be listening (unless manually stopped)
             // simplified: just stop state
             setIsListening(false);
        };
    }
  }, []);

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Speech recognition is not supported in this browser.");
          return;
      }

      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) return;
    
    let style = COMIC_STYLES.find(s => s.id === selectedStyleId);
    
    // Handle Custom Image Style
    if (selectedStyleId === 'custom' && customStyle) {
        style = customStyle;
    }
    
    // Handle Custom Text Style
    if (selectedStyleId === 'custom_text') {
        if (!customTextStyle.trim()) {
            alert("Please describe the art style.");
            return;
        }
        style = {
            id: 'custom_text',
            name: 'Custom Description',
            promptModifier: customTextStyle,
            previewColor: 'from-pink-500 to-orange-400',
            isCustom: true
        };
    }
    
    if (style) {
        onAnalyze(story, style);
    }
  };

  const handleFillMock = () => {
    setStory(MOCK_STORY);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingStyle(true);
    setSelectedStyleId('custom');

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
            const styleDescription = await analyzeImageStyle(base64String);
            const newCustomStyle: ComicStyle = {
                id: 'custom',
                name: 'Custom Style',
                promptModifier: styleDescription,
                previewColor: 'from-gray-500 to-gray-900',
                isCustom: true
            };
            setCustomStyle(newCustomStyle);
        } catch (err) {
            console.error("Failed to analyze style", err);
            alert("Failed to analyze image style. Please try another image.");
            setSelectedStyleId(COMIC_STYLES[0].id);
        } finally {
            setIsAnalyzingStyle(false);
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-8 h-8 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white font-comic-header tracking-wide">Create Your Story</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Story Input */}
        <div className="space-y-2">
          <label htmlFor="story" className="block text-sm font-medium text-gray-300">
            Write your story (or paste a scene)
          </label>
          <div className="relative">
            <textarea
              id="story"
              rows={6}
              className="w-full bg-gray-900 border-gray-600 rounded-lg p-4 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-sans text-lg leading-relaxed"
              placeholder="Once upon a time in a galaxy far, far away..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              disabled={isProcessing}
            />
            
            <div className="absolute bottom-3 right-3 flex space-x-2">
                 <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    title="Voice Input"
                >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                type="button"
                onClick={handleFillMock}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                Auto-fill Example
                </button>
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Choose an Art Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMIC_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyleId(style.id)}
                disabled={isProcessing || isAnalyzingStyle}
                className={`
                  relative overflow-hidden rounded-lg p-3 h-24 text-left transition-all duration-300 border-2
                  ${selectedStyleId === style.id 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-[1.02]' 
                    : 'border-gray-700 hover:border-gray-500 hover:bg-gray-750'}
                `}
              >
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${style.previewColor}`} />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <span className={`font-bold text-sm md:text-base leading-tight ${selectedStyleId === style.id ? 'text-white' : 'text-gray-300'}`}>
                    {style.name}
                  </span>
                  {selectedStyleId === style.id && (
                    <Sparkles className="w-4 h-4 text-indigo-400 absolute bottom-0 right-0" />
                  )}
                </div>
              </button>
            ))}
            
            {/* Custom Style Upload Button */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isAnalyzingStyle}
                className={`
                  relative overflow-hidden rounded-lg p-3 h-24 text-left transition-all duration-300 border-2 border-dashed
                  ${selectedStyleId === 'custom' 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-gray-800' 
                    : 'border-gray-600 hover:border-gray-400 hover:bg-gray-750'}
                `}
            >
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                 />
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    {isAnalyzingStyle ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
                    ) : selectedStyleId === 'custom' && customStyle ? (
                        <>
                           <span className="text-xs text-indigo-300 font-bold mb-1">Style Active</span>
                           <span className="text-[10px] text-gray-400 line-clamp-2">{customStyle.promptModifier.slice(0, 40)}...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-400">Upload Style Image</span>
                        </>
                    )}
                 </div>
            </button>

            {/* Custom Style Text Description Button */}
            <button
                type="button"
                onClick={() => setSelectedStyleId('custom_text')}
                disabled={isProcessing || isAnalyzingStyle}
                className={`
                  relative overflow-hidden rounded-lg p-3 h-24 text-left transition-all duration-300 border-2 border-dashed
                  ${selectedStyleId === 'custom_text' 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-gray-800' 
                    : 'border-gray-600 hover:border-gray-400 hover:bg-gray-750'}
                `}
            >
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <Pencil className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Describe Style</span>
                 </div>
            </button>
          </div>

          {/* Text Input Area for Custom Style */}
          {selectedStyleId === 'custom_text' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 p-4 bg-gray-800 rounded-lg border border-indigo-500/30">
                  <label className="block text-sm font-medium text-indigo-300 mb-2">
                      Describe your custom artistic style
                  </label>
                  <textarea
                      value={customTextStyle}
                      onChange={(e) => setCustomTextStyle(e.target.value)}
                      placeholder="e.g. Oil painting, thick brush strokes, impressionist style, vibrant blue and gold color palette..."
                      rows={2}
                      autoFocus
                      className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  />
              </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!story.trim() || isProcessing || isAnalyzingStyle}
            className={`
              w-full py-4 px-6 rounded-lg font-bold text-xl flex items-center justify-center space-x-3 transition-all transform
              ${!story.trim() || isProcessing || isAnalyzingStyle
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95'}
            `}
          >
            {isProcessing || isAnalyzingStyle ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>{isAnalyzingStyle ? "Analyzing Style..." : "Analyzing Story..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Analyze & Plan Comic</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoryForm;