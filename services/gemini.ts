import { GoogleGenAI, Type } from "@google/genai";
import { StoryPage } from "../types";

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY || null;
};

export const setStoredApiKey = (key: string) => {
  localStorage.setItem('gemini_api_key', key);
};

export const removeStoredApiKey = () => {
  localStorage.removeItem('gemini_api_key');
};

const getAiClient = () => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("API Key missing. Please add your Google Gemini API Key in settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'test',
    });
    return true;
  } catch (e) {
    console.error("API Key validation failed", e);
    return false;
  }
};

export const generateMagicPhoto = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const ai = getAiClient();
  
  const enhancedPrompt = `${prompt}
  
  STRICT IDENTITY PROTOCOL (MANDATORY):
  1. ABSOLUTE FACE MATCH: The generated child MUST be a 1:1 likeness of the child in the reference photo. 
  2. HAIR CONSISTENCY: Match the EXACT length, texture, and style of the hair in the photo. DO NOT change it.
  3. SKIN TONE LOCK: Use the EXACT luminosity from the photo's highlights. This child has a FAIR, LIGHT-Mixed complexion. DO NOT add extra melanin. Use "Golden-Ivory" and "Light-Beige" tones.
  4. NO ETHNIC DRIFT: Do not alter facial features to fit a generic racial archetype. Keep the specific eye shape and features from the photo.
  5. RECOGNIZABILITY: The child must be instantly recognizable as the specific individual in the source photo.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: enhancedPrompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
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
  const ai = getAiClient();
  const prompt = `Write a children's story for a ${ageGroup} named ${name}. Theme: ${theme}. 6 pages. Return JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
  const ai = getAiClient();
  
  let fullPrompt = `High-quality 2D digital illustration for a children's book. 
  
  CHARACTER IDENTITY ANCHOR (STRICTEST PRIORITY):
  - This is a story about the SPECIFIC child in the attached photo. 
  - CONSISTENCY: The face, hair, and skin tone MUST be identical on every page.
  - HAIR: Match the EXACT length and texture from the photo. Do not change the hairstyle.
  - SKIN TONE: Use a FAIR, LIGHT-GOLDEN Mixed complexion. DO NOT DARKEN. Use high-luminosity highlights matching the photo's forehead. 
  - NO GENERIC ARCHETYPES: Avoid defaulting to generic racial features. Stick to the 1:1 facial structure of the child in the image.
  - STYLE: Keep the art style consistent (vibrant, clean 2D).

  SCENE DESCRIPTION: ${prompt}`;

  if (appearanceDescription) {
      fullPrompt += `\n\nUSER-SPECIFIED CONSTANTS: ${appearanceDescription}`;
  }

  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: parts }
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
  const ai = getAiClient();
  let fullPrompt = `Clean black and white line art coloring page. Bold outlines, pure white background. ${prompt}`;
  if (appearanceDescription) fullPrompt += ` Specific character features to maintain: ${appearanceDescription}.`;
  
  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
    parts[0].text += " Use the photo as the SOLE reference for facial features and hair length.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts }
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
    const ai = getAiClient();
    let fullPrompt = `Die-cut sticker on white background. Style: ${prompt}.
    STRICT IDENTITY: Maintain the exact fair skin tone and hairstyle from the photo. Zero alteration to race or features.`;

    if (appearanceDescription) fullPrompt += `\nCharacter Description: ${appearanceDescription}`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullPrompt },
          { inlineData: { mimeType, data: base64Image } }
        ]
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