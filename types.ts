export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export enum GenerationType {
  TEXT_TO_VIDEO = 'TEXT_TO_VIDEO',
  IMAGE_TO_VIDEO = 'IMAGE_TO_VIDEO',
}

export interface VideoStyle {
  id: string;
  name: string;
  promptModifier: string;
  previewColor: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: number;
  type: GenerationType;
  aspectRatio: AspectRatio;
  resolution: Resolution;
}

export interface GenerationStats {
  style: string;
  count: number;
}