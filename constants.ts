import { VideoStyle } from './types';

export const VIDEO_STYLES: VideoStyle[] = [
  { id: 'realistic', name: 'Realistic', promptModifier: 'cinematic, photorealistic, 4k, highly detailed, realistic lighting', previewColor: 'bg-blue-500' },
  { id: 'anime', name: 'Anime', promptModifier: 'anime style, studio ghibli, vibrant colors, cell shaded, high quality animation', previewColor: 'bg-pink-500' },
  { id: 'cartoon', name: 'Cartoon', promptModifier: 'cartoon style, 3d render, pixar style, cute, smooth animation', previewColor: 'bg-yellow-500' },
  { id: 'surreal', name: 'Surreal', promptModifier: 'surrealism, dreamlike, dali style, floating objects, abstract, mysterious', previewColor: 'bg-purple-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', promptModifier: 'cyberpunk, neon lights, futuristic city, rain, high tech, blade runner style', previewColor: 'bg-cyan-500' },
  { id: 'vintage', name: 'Vintage', promptModifier: 'vintage film look, 1950s style, black and white, grainy, classic cinema', previewColor: 'bg-sepia-500' },
];

export const MOCK_VIDEOS = [
  // Placeholder for initial state if needed
];
