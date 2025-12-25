export enum AppMode {
  IMAGE_GEN = 'IMAGE_GEN',
  VIDEO_ANIM = 'VIDEO_ANIM'
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '3:4' | '4:3';
export type ImageSize = '1K' | '2K' | '4K';
export type VideoResolution = '720p' | '1080p';

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GenerationState {
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
}