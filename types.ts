export interface ComicPanel {
  id: number;
  description: string;
  dialogue: string;
  caption: string;
  soundEffect?: string;
  layout: 'square' | 'wide' | 'tall';
  imageUrl?: string;
  isGenerating: boolean;
}

export interface ComicStyle {
  id: string;
  name: string;
  promptModifier: string;
  previewColor: string;
  isCustom?: boolean;
}

export interface Character {
  name: string;
  description: string;
}

export interface StoryAnalysis {
  characters: Character[];
  genre: string;
  tone: string;
  feedback: string;
}

export interface ScriptResponse {
  panels: {
    description: string;
    dialogue: string;
    caption: string;
    soundEffect?: string;
    layout: 'square' | 'wide' | 'tall';
  }[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING_STORY = 'ANALYZING_STORY',
  REVIEW_ANALYSIS = 'REVIEW_ANALYSIS',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
