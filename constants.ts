import { ComicStyle } from './types';

export const COMIC_STYLES: ComicStyle[] = [
  {
    id: 'superhero',
    name: 'American Superhero',
    promptModifier: 'American superhero comic book style, bold lines, dynamic action, vibrant colors, dramatic shading, halftime patterns',
    previewColor: 'from-blue-600 to-red-600'
  },
  {
    id: 'noir',
    name: 'Noir Detective',
    promptModifier: 'Film noir comic style, high contrast black and white, moody shadows, gritty texture, mysterious atmosphere',
    previewColor: 'from-gray-700 to-black'
  },
  {
    id: 'manga',
    name: 'Japanese Manga',
    promptModifier: 'Japanese manga style, black and white ink, screentones, expressive characters, dynamic speed lines, detailed backgrounds',
    previewColor: 'from-pink-500 to-purple-600'
  },
  {
    id: 'ligne-claire',
    name: 'Ligne Claire',
    promptModifier: 'Ligne claire style, clear strong lines, flat colors, no hatching, european comic book aesthetic, tintin style',
    previewColor: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    promptModifier: 'Cyberpunk comic style, neon lights, futuristic cityscapes, technological details, synthwave color palette, dark gritty future',
    previewColor: 'from-cyan-400 to-fuchsia-600'
  },
  {
    id: 'vintage',
    name: 'Vintage 50s Horror',
    promptModifier: 'Vintage 1950s horror comic style, retro color palette, aged paper texture, pulp comic aesthetic, EC comics style',
    previewColor: 'from-green-700 to-yellow-800'
  }
];

export const MOCK_STORY = "The detective walked into the rain-slicked alley. He saw a shadow move behind the dumpsters. 'Come out!' he shouted, reaching for his revolver. A small cat emerged, meowing softly. The detective sighed, holstering his weapon, but then noticed the cat's eyes were glowing a menacing red.";
