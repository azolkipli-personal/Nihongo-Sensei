import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    wordDetails: {
      type: Type.OBJECT,
      description: "The different writings of the word.",
      properties: {
        kanji: {
          type: Type.STRING,
          description: "The word in its original form, possibly including kanji (e.g., '日本語').",
        },
        kana: {
          type: Type.STRING,
          description: "The hiragana or katakana reading of the word (e.g., 'にほんご').",
        },
        romaji: {
          type: Type.STRING,
          description: "The romaji transliteration of the word (e.g., 'nihongo').",
        },
      },
      required: ["kanji", "kana", "romaji"]
    },
    meaning: {
      type: Type.STRING,
      description: "The detailed English meaning of the Japanese word/phrase.",
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
                japanese: { type: Type.STRING, description: "The dialogue line in Japanese, with furigana for kanji in the format '漢字[かんじ]'." },
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
  required: ["wordDetails", "meaning", "conversations"]
};


export const generateWithGemini = async (model, word, scenario, apiKey) => {
    if (!apiKey) {
        throw new Error("Google Gemini API key is not configured. Please set it in the settings.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
  const prompt = `
    You are an expert Japanese language teacher.
    Your student wants to learn the word/phrase: "${word}".
    The context for learning is the following scenario: "${scenario}".

    Your task is to provide the following in a structured JSON format:
    1.  **wordDetails**: An object containing the kanji, kana, and romaji writings of "${word}".
    2.  **meaning**: A clear and concise English definition of "${word}".
    3.  **conversations**: Exactly 5 distinct, practical, and natural-sounding example conversations that demonstrate how to use "${word}" within the specified scenario: "${scenario}".
    
    IMPORTANT: For each 'japanese' dialogue line, provide furigana for all kanji using the format 'BaseKanji[reading]'.
    For example, '日本語が話せます' should be formatted as '日[に]本[ほん]語[ご]が話[はな]せます'.
    Kana-only words should not have brackets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);
    
    if (!parsedResult.wordDetails || !parsedResult.meaning || !Array.isArray(parsedResult.conversations)) {
        throw new Error("Invalid response structure from API.");
    }

    return parsedResult;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate learning content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};