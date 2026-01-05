import { GoogleGenAI, Type } from "@google/genai";
import { StoryPage } from "../types";

/**
 * ABSOLUTE IDENTITY & CHROMATIC FIDELITY PROTOCOL (v3.0)
 * This protocol is designed to eliminate racial hallucinations and protect the 
 * specific identity of multiracial, biracial, and light-skinned children.
 */
const IDENTITY_LOCK = `
CRITICAL IDENTITY & CHROMATIC FIDELITY LOCK:
1. PIXEL-MIRROR SKIN TONE: You MUST treat the reference photo's skin as the ABSOLUTE visual truth. Analyze the exact RGB/Luminosity levels. If the child in the photo is light-skinned (e.g., biracial, multiracial), the output MUST be identically light-skinned. Do NOT darken the complexion. Do NOT apply "Black" or "White" archetypes; capture the "in-between" nuances perfectly.
2. NEUTRAL TRAIT INTERPRETATION: Terms like "curly hair," "braids," "pigtails," or "full lips" are GEOMETRIC TEXTURES only. They are NOT racial markers. You are strictly forbidden from changing the skin tone or facial structure of the child because of these descriptors. 
3. FACIAL ANCHORING: Maintain the specific facial structure, eye shape, nose bridge, and lip shape of the child in the photo. The result must be a 1:1 character likeness.
4. ANTI-STEREOTYPE BIAS: Ignore all internal "diversity presets" or statistical biases. If the user says "curly hair," do NOT default to a Black child if the photo shows a light-skinned biracial child. 
5. MULTIRACIAL PROTECTIONS: Specifically preserve the unique skin tone of biracial children who have light complexions. 
`;

export const generateMagicPhoto = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `
  ${IDENTITY_LOCK}
  TASK: Create a photorealistic artpiece.
  SCENE: ${prompt}
  MANDATORY: The subject in the output MUST be an identical twin of the child in the photo. Match the exact light-skinned biracial complexion and facial identity. No racial shifting.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: enhancedPrompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
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
  
  let fullPrompt = `
  ${IDENTITY_LOCK}
  STYLE: Premium 2D children's book digital art.
  SCENE: ${prompt}
  FIDELITY: The character MUST match the photo's identity exactly, especially the specific light skin tone and facial features.
  `;

  if (appearanceDescription) {
      fullPrompt += `\nSTYLE NOTES: ${appearanceDescription}. (CRITICAL: These are for outfit/hair texture ONLY. They must never trigger a racial shift or skin tone change from the photo).`;
  }

  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: parts },
    config: {
      imageConfig: { aspectRatio: "1:1" }
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
  let fullPrompt = `
  ${IDENTITY_LOCK}
  STYLE: Clean line art coloring page. Bold outlines, white background.
  IDENTITY MATCH: Draw the child with the exact facial features and proportions of the person in the photo.
  `;
  
  if (appearanceDescription) fullPrompt += `\nNOTES: ${appearanceDescription}.`;
  
  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: { aspectRatio: "1:1" }
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
    let fullPrompt = `
    ${IDENTITY_LOCK}
    STYLE: Die-cut sticker, white border, white background.
    VIBE: ${prompt}.
    MANDATORY FIDELITY: The character in the sticker MUST be an identical visual match to the reference photo. 
    SKIN TONE ALERT: The child in the photo is light-skinned biracial. You MUST sample the exact light skin tone. Do NOT default to a darker skin tone just because of hair descriptions.
    `;
    
    if (appearanceDescription) fullPrompt += `\nSPECIFIC DETAILS: ${appearanceDescription}`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullPrompt },
          { inlineData: { mimeType, data: base64Image } }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
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