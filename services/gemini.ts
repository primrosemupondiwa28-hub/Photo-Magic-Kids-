import { GoogleGenAI, Type } from "@google/genai";
import { StoryPage } from "../types";

// Safety Settings for Kids App
const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
];

/**
 * Helper to get the AI client using the environment key.
 * This prevents the "API Key must be set" browser error by checking 
 * the existence of the key before instantiation.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "") {
    console.error("Critical: API_KEY is missing from the environment.");
    throw new Error("The Magic Studio is having a little nap. Please try again in a moment!");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * DAILY QUOTA GUARD
 * Simulates backend rate limiting/daily caps
 */
const checkQuota = () => {
  const today = new Date().toDateString();
  const usageData = JSON.parse(localStorage.getItem('pmk_usage') || '{}');
  
  if (usageData.date !== today) {
    usageData.date = today;
    usageData.count = 0;
  }

  const DAILY_LIMIT = 20;
  if (usageData.count >= DAILY_LIMIT) {
    throw new Error("Daily magic limit reached! Come back tomorrow for more adventures.");
  }

  usageData.count += 1;
  localStorage.setItem('pmk_usage', JSON.stringify(usageData));
};

const IDENTITY_LOCK = `
CRITICAL IDENTITY LOCK:
Treat the reference photo as absolute visual truth. Preserve skin tone, facial structure, and identity exactly as seen.
Terms like "curly hair" are texture descriptors only and must not trigger skin tone shifts.
Zero racial bias. Match the subject's identity as a 1:1 twin.
`;

export const generateMagicPhoto = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  checkQuota();
  const ai = getAIClient();
  
  const enhancedPrompt = `${IDENTITY_LOCK}\nSCENE: ${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: enhancedPrompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" },
      safetySettings
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("The magic didn't work this time.");
  return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
};

export const generateStory = async (
  name: string,
  ageGroup: string,
  theme: string
): Promise<StoryPage[]> => {
  checkQuota();
  const ai = getAIClient();
  const prompt = `Write a creative 6-page children's story for a ${ageGroup} named ${name}. Theme: ${theme}. Return JSON with "text" and "illustrationPrompt" for each page.`;

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
      },
      safetySettings
    }
  });

  if (!response.text) throw new Error("The storyteller is sleeping.");
  return JSON.parse(response.text) as StoryPage[];
};

export const generateIllustration = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  checkQuota();
  const ai = getAIClient();
  
  let fullPrompt = `${IDENTITY_LOCK}\nSTYLE: Premium 2D children's book digital art.\nSCENE: ${prompt}`;
  if (appearanceDescription) fullPrompt += `\nSTYLE NOTES: ${appearanceDescription}`;

  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) parts.push({ inlineData: { mimeType, data: base64Image } });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: { aspectRatio: "1:1" },
      safetySettings
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("Failed to paint illustration.");
  return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
};

export const generateColoringPage = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  checkQuota();
  const ai = getAIClient();
  let fullPrompt = `${IDENTITY_LOCK}\nSTYLE: Clean line art coloring page. Bold outlines, white background.\nSCENE: ${prompt}`;
  if (appearanceDescription) fullPrompt += `\nNOTES: ${appearanceDescription}`;
  
  const parts: any[] = [{ text: fullPrompt }];
  if (base64Image) parts.push({ inlineData: { mimeType, data: base64Image } });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: { aspectRatio: "1:1" },
      safetySettings
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("No coloring page generated.");
  return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
};

export const generateSticker = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  checkQuota();
  const ai = getAIClient();
  let fullPrompt = `${IDENTITY_LOCK}\nSTYLE: Die-cut sticker, white border, white background.\nVIBE: ${prompt}`;
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
      imageConfig: { aspectRatio: "1:1" },
      safetySettings
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("No sticker generated.");
  return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
};