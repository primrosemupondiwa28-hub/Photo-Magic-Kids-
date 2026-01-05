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
 * Direct initialization of the Gemini client.
 * Relies on the environment variable process.env.API_KEY.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  // If the key is totally missing at runtime, we provide a generic error message 
  // without mentioning configuration, keeping it kids-friendly.
  if (!apiKey) {
    console.warn("Gemini API key not found in environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

/**
 * DAILY QUOTA GUARD
 * Simulates basic usage management
 */
const checkQuota = () => {
  const today = new Date().toDateString();
  const usageData = JSON.parse(localStorage.getItem('pmk_usage') || '{}');
  
  if (usageData.date !== today) {
    usageData.date = today;
    usageData.count = 0;
  }

  const DAILY_LIMIT = 50; // Increased limit for better user experience
  if (usageData.count >= DAILY_LIMIT) {
    throw new Error("The magic studio is resting for the day! Come back tomorrow.");
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
  try {
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
    if (!part?.inlineData?.data) throw new Error("Magic failed to materialize.");
    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  } catch (err: any) {
    console.error("Image generation error:", err);
    throw new Error("The magic brush is recharging. Please try again in a few seconds!");
  }
};

export const generateStory = async (
  name: string,
  ageGroup: string,
  theme: string
): Promise<StoryPage[]> => {
  checkQuota();
  try {
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

    if (!response.text) throw new Error("Storyteller is thinking deeply.");
    return JSON.parse(response.text) as StoryPage[];
  } catch (err) {
    console.error("Story generation error:", err);
    throw new Error("The storyteller is taking a quick break!");
  }
};

export const generateIllustration = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  checkQuota();
  try {
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
    if (!part?.inlineData?.data) throw new Error("Failed to paint.");
    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  } catch (err) {
    console.error("Illustration error:", err);
    throw new Error("The easel is being cleaned. One moment!");
  }
};

export const generateColoringPage = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  checkQuota();
  try {
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
    if (!part?.inlineData?.data) throw new Error("No lines drawn.");
    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  } catch (err) {
    console.error("Coloring page error:", err);
    throw new Error("The coloring pens are being sharpened!");
  }
};

export const generateSticker = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg',
  appearanceDescription?: string
): Promise<string> => {
  checkQuota();
  try {
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
    if (!part?.inlineData?.data) throw new Error("No sticker made.");
    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  } catch (err) {
    console.error("Sticker error:", err);
    throw new Error("The sticker printer is heating up!");
  }
};