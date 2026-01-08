import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponse, StoryAnalysis, Character } from "../types";

// Helper to get initialized client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeStory = async (story: string): Promise<StoryAnalysis> => {
  const ai = getClient();
  
  const prompt = `
    Analyze the following story for a comic book adaptation.
    1. Identify key characters and provide a concise visual description for each (hair, clothes, distinctive features).
    2. Determine the Genre and Tone.
    3. Provide brief creative feedback or suggestions to make the comic better (pacing, visual focus).

    Story: "${story}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["name", "description"]
            }
          },
          genre: { type: Type.STRING },
          tone: { type: Type.STRING },
          feedback: { type: Type.STRING }
        },
        required: ["characters", "genre", "tone", "feedback"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to analyze story");
  }

  try {
    return JSON.parse(response.text) as StoryAnalysis;
  } catch (e) {
    console.error("Failed to parse analysis JSON", response.text);
    throw new Error("Failed to parse analysis JSON");
  }
};

export const generateComicScript = async (story: string, characters: Character[] = []): Promise<ScriptResponse> => {
  const ai = getClient();
  
  const characterContext = characters.length > 0 
    ? `\nKeep these character visual definitions consistent strictly:\n${characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}\n`
    : "";

  const prompt = `
    You are an expert comic book writer and artist. 
    Analyze the following story and break it down into a sequence of 4 to 6 comic book panels.
    ${characterContext}
    For each panel, provide:
    1. A detailed visual description for an image generator (include angle, lighting, character details). Ensure characters match the provided definitions if present.
    2. Dialogue (if any characters are speaking) or "N/A" if silent. Format: "Character: Line".
    3. A narrative caption (voiceover or context) or "N/A" if not needed.
    4. A sound effect text (onomatopoeia) if appropriate (e.g., "POW!", "SPLASH", "RUMBLE"), or "N/A" if silent.
    5. A layout suggestion: 'wide' (for establishing shots), 'tall' (for character focus), or 'square' (standard action).

    Story: "${story}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                dialogue: { type: Type.STRING },
                caption: { type: Type.STRING },
                soundEffect: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ["square", "wide", "tall"] }
              },
              required: ["description", "dialogue", "caption", "soundEffect", "layout"]
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate script: No text in response");
  }

  try {
    return JSON.parse(response.text) as ScriptResponse;
  } catch (e) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("Failed to parse script JSON");
  }
};

export const generatePanelImage = async (panelDescription: string, stylePrompt: string): Promise<string> => {
  const ai = getClient();
  const fullPrompt = `${stylePrompt}. ${panelDescription}. High quality, detailed masterpiece.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: fullPrompt }]
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation error:", error);
    return `https://picsum.photos/800/800?blur=5&random=${Math.random()}`; 
  }
};

export const refinePanelImage = async (base64Data: string, instruction: string): Promise<string> => {
  const ai = getClient();

  // Parse mime type and data
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  const mimeType = matches ? matches[1] : 'image/png'; // Default fallbacks
  const data = matches ? matches[2] : base64Data.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: instruction }
        ],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in refine response");
  } catch (error) {
    console.error("Refine image error:", error);
    throw error;
  }
};

export const generateSoundEffect = async (description: string): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest a single comic book sound effect word (onomatopoeia) for this scene: "${description}". Return ONLY the word (e.g., BANG, WHOOSH, CRACK) or "N/A" if none fits.`,
        });
        const text = response.text?.trim() || "";
        return text.includes("N/A") ? "" : text.replace(/[^a-zA-Z!]/g, "");
    } catch (e) {
        console.error("SFX generation failed", e);
        return "";
    }
};

export const analyzeImageStyle = async (base64Data: string): Promise<string> => {
    const ai = getClient();
    
    const cleanBase64 = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                { text: "Describe the artistic style of this image in 50 words or less. Focus on medium, line quality, color palette, and mood. Format it as a prompt modifier for an image generator (e.g. 'Art style: ...')." }
            ]
        }
      });

      return response.text || "A custom artistic style.";
    } catch (e) {
      console.error("Style analysis failed", e);
      return "A unique custom artistic style.";
    }
}
