import { GoogleGenAI, Type } from "@google/genai";
import { StoryPage } from "../types";

export const generateMagicPhoto = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `${prompt}
  
  STRICT IDENTITY PROTOCOL (FLASH):
  1. ABSOLUTE FACE MATCH: The child must look exactly like the reference photo.
  2. CHARACTER CONSISTENCY: Maintain facial features, hair texture, and skin tone.
  3. CLEAR ARTISTRY: Create a high-quality transformation while keeping the child's identity clear.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: enhancedPrompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    },
    config: {
      imageConfig: { 
        aspectRatio: "1:1"
      }
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
  const prompt = `Write a creative 6-page children's story for a ${ageGroup} named ${name}. Theme: ${theme}. Return JSON with "text" and "illustrationPrompt" for each page.`;

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
  
  let fullPrompt = `Children's book illustration. Style: Vibrant 2D digital art. 
  SCENE: ${prompt}
  CHARACTER IDENTITY: The main character must match the child in the photo exactly.`;

  if (appearanceDescription) {
      fullPrompt += ` Appearance notes: ${appearanceDescription}`;
  }

  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: parts },
    config: {
      imageConfig: { 
        aspectRatio: "1:1"
      }
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
  let fullPrompt = `Black and white line art coloring page for kids. Bold outlines, clean white background, no shading. ${prompt}`;
  if (appearanceDescription) fullPrompt += ` Character: ${appearanceDescription}.`;
  
  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: { 
        aspectRatio: "1:1"
      }
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
    let fullPrompt = `Die-cut sticker style on pure white background with thick white border. ${prompt}.`;
    if (appearanceDescription) fullPrompt += ` Character details: ${appearanceDescription}`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullPrompt },
          { inlineData: { mimeType, data: base64Image } }
        ]
      },
      config: {
        imageConfig: { 
          aspectRatio: "1:1"
        }
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