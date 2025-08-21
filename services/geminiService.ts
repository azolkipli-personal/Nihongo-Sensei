
import { GoogleGenAI, Type } from "@google/genai";
import type { LearningResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    meaning: {
      type: Type.STRING,
      description: "The detailed English meaning of the Japanese word/phrase.",
    },
    reading: {
      type: Type.STRING,
      description: "The hiragana or katakana reading of the Japanese word/phrase.",
    },
    conversations: {
      type: Type.ARRAY,
      description: "An array of 5 distinct example conversations.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A short, descriptive title for the conversation."
          },
          dialogue: {
            type: Type.ARRAY,
            description: "The lines of dialogue in the conversation.",
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING, description: "The speaker's name or role (e.g., 'A-san', '店員')." },
                japanese: { type: Type.STRING, description: "The dialogue line in Japanese." },
                romaji: { type: Type.STRING, description: "The romaji transliteration of the Japanese line." },
                english: { type: Type.STRING, description: "The English translation of the line." },
              },
              required: ["speaker", "japanese", "romaji", "english"]
            }
          }
        },
        required: ["title", "dialogue"]
      }
    }
  },
  required: ["meaning", "reading", "conversations"]
};

export const generateLearningContent = async (word: string, scenario: string): Promise<LearningResult> => {
  const prompt = `
    You are an expert Japanese language teacher.
    Your student wants to learn the word/phrase: "${word}".
    The context for learning is the following scenario: "${scenario}".

    Your task is to provide the following in a structured JSON format:
    1.  **meaning**: A clear and concise English definition of "${word}".
    2.  **reading**: The hiragana or katakana reading for "${word}". If it's already in kana, just repeat it.
    3.  **conversations**: Exactly 5 distinct, practical, and natural-sounding example conversations that demonstrate how to use "${word}" within the specified scenario: "${scenario}". Each conversation should be unique and highlight a different nuance if possible. For each line of dialogue, provide the Japanese, the Romaji, and the English translation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);
    
    // Basic validation
    if (!parsedResult.meaning || !parsedResult.reading || !Array.isArray(parsedResult.conversations)) {
        throw new Error("Invalid response structure from API.");
    }

    return parsedResult as LearningResult;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate learning content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};
