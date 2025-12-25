import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Helper to ensure we get a fresh instance with the latest key selection
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCinematicImage = async (
  prompt: string,
  imageSize: ImageSize,
  aspectRatio: AspectRatio
): Promise<string> => {
  const ai = getAIClient();
  
  // Model: Nano Banana Pro (Gemini 3 Pro Image)
  const modelName = 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          imageSize: imageSize,
          aspectRatio: aspectRatio,
        },
        // Safety settings can be adjusted here if needed
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from API.");
  } catch (error: any) {
    console.error("Image generation failed:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

export const animateImageWithVeo = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  const ai = getAIClient();
  const modelName = 'veo-3.1-fast-generate-preview';

  try {
    // Start operation
    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: prompt || "Animate this scene cinematically",
      image: {
        imageBytes: imageBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        // fast-generate-preview typically outputs 720p usually, but we request what's supported
        resolution: '720p', 
        aspectRatio: aspectRatio,
      },
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(operation.error.message || "Video generation failed during processing.");
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned.");
    }

    // Append API Key for access
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error: any) {
    console.error("Video animation failed:", error);
    throw new Error(error.message || "Failed to animate image.");
  }
};