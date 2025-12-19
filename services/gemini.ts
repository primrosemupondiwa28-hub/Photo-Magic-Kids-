import { GoogleGenAI, Type } from "@google/genai";
import { StoryPage } from "../types";

// Helper to check if a key is available
export const hasApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return !!process.env.API_KEY;
};

// Helper to open the selection dialog
export const openKeySelector = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
    await (window as any).aistudio.openSelectKey();
    // After triggering, we proceed assuming success as per guidelines
    return true;
  }
  return false;
};

export const generateMagicPhoto = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `${prompt}
  
  STRICT IDENTITY PROTOCOL (MANDATORY):
  1. ABSOLUTE FACE MATCH: The generated child MUST be a 1:1 likeness of the child in the reference photo. 
  2. HAIR CONSISTENCY: Match the EXACT length, texture, and style of the hair in the photo. 
  3. SKIN TONE LOCK: Use the EXACT luminosity from the photo's highlights. Maintain the fair/light complexion.
  4. RECOGNIZABILITY: The child must be instantly recognizable as the specific individual in the source photo.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: enhancedPrompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image generated.");
};

export const generateStory = async (
  name: string,
  ageGroup: string,
  theme: string
): Promise<StoryPage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a children's story for a ${ageGroup} named ${name}. Theme: ${theme}. 6 pages. Return JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            illustrationPrompt: { type: Type.STRING }
          },
          required: ["text", "illustrationPrompt"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No story generated");
  return JSON.parse(text) as StoryPage[];
};

export const generateIllustration = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let fullPrompt = `High-quality 2D digital illustration for a children's book. 
  
  CHARACTER IDENTITY ANCHOR:
  - This is the SPECIFIC child in the attached photo. 
  - CONSISTENCY: Face, hair, and skin tone MUST be identical to the photo.
  - STYLE: Vibrant, clean 2D children's book style.

  SCENE: ${prompt}`;

  if (appearanceDescription) {
      fullPrompt += `\n\nUSER-SPECIFIED CONSTANTS: ${appearanceDescription}`;
  }

  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: parts },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
    }
  }
  throw new Error("Failed to generate illustration");
};

export const generateColoringPage = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let fullPrompt = `Clean black and white line art coloring page. Bold outlines, pure white background. ${prompt}`;
  if (appearanceDescription) fullPrompt += ` Specific character features: ${appearanceDescription}.`;
  
  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No coloring page generated.");
};

export const generateSticker = async (
    base64Image: string,
    prompt: string,
    mimeType: string = 'image/jpeg',
    appearanceDescription?: string
  ): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let fullPrompt = `Die-cut sticker on white background. Style: ${prompt}.`;
    if (appearanceDescription) fullPrompt += `\nCharacter Description: ${appearanceDescription}`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: fullPrompt },
          { inlineData: { mimeType, data: base64Image } }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
      }
    });
  
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No sticker generated.");
  };