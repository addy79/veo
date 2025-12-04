import { GoogleGenAI } from "@google/genai";
import { AspectRatio, Resolution } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // We instantiate lazily to ensure we catch the latest API Key
  }

  private getClient(): GoogleGenAI {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found. Please select a key.");
    }
    // Always create a new instance to ensure we use the latest key
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async checkApiKey(): Promise<boolean> {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.hasSelectedApiKey) {
      return await aistudio.hasSelectedApiKey();
    }
    return !!process.env.API_KEY;
  }

  async openApiKeyDialog(): Promise<void> {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
    }
  }

  async generateVideoFromText(
    prompt: string,
    aspectRatio: AspectRatio = '16:9',
    resolution: Resolution = '720p'
  ): Promise<string> {
    const client = this.getClient();
    
    // Using fast-generate-preview for better interactive experience
    const model = 'veo-3.1-fast-generate-preview'; 

    let operation = await client.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio,
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await client.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("Failed to generate video: No URI returned.");
    }

    return `${videoUri}&key=${process.env.API_KEY}`;
  }

  async generateVideoFromImage(
    imageBase64: string,
    prompt?: string,
    aspectRatio: AspectRatio = '16:9',
    resolution: Resolution = '720p'
  ): Promise<string> {
    const client = this.getClient();
    const model = 'veo-3.1-fast-generate-preview';

    // Remove data URL prefix if present for raw bytes processing if needed, 
    // but the SDK handles base64 usually. 
    // The SDK expects pure base64 in `imageBytes`.
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/png';

    let operation = await client.models.generateVideos({
      model: model,
      prompt: prompt || "Animate this image", // Prompt is optional but recommended
      image: {
        imageBytes: base64Data,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await client.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("Failed to generate video: No URI returned.");
    }

    return `${videoUri}&key=${process.env.API_KEY}`;
  }
}

export const geminiService = new GeminiService();