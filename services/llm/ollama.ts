export const fetchOllamaModels = async (url) => {
    const response = await fetch(new URL('/api/tags', url));
    if (!response.ok) {
        throw new Error(`Failed to fetch models from Ollama. Status: ${response.status}`);
    }
    const data = await response.json();
    return data.models.map(model => model.name);
};


export const generateWithOllama = async (
    model, 
    word, 
    scenario, 
    url
) => {
    const prompt = `
    You are an expert Japanese language teacher.
    Your student wants to learn the word/phrase: "${word}".
    The context for learning is the following scenario: "${scenario}".

    Your task is to provide a JSON object that follows a specific structure.
    Respond with ONLY the raw JSON object, without any surrounding text, explanations, or markdown formatting like \`\`\`json.

    The JSON object must contain these exact keys: "wordDetails", "meaning", and "conversations".
    1.  "wordDetails": An object containing the "kanji" (original form), "kana" (reading), and "romaji" writings of "${word}".
    2.  "meaning": A clear and concise English definition of "${word}".
    3.  "conversations": An array of EXACTLY 5 distinct, practical, and natural-sounding example conversations using "${word}" in the context of "${scenario}".
        - Each object in the "conversations" array must have a "title" and a "dialogue" array.
        - Each object in the "dialogue" array must have "speaker", "japanese", "romaji", and "english" keys.
    
    IMPORTANT RULE: For each "japanese" dialogue line, you MUST provide furigana for all kanji using the format 'BaseKanji[reading]'.
    For example, '日本語が話せます' should be formatted as '日[に]本[ほん]語[ご]が話[はな]せます'.
    Kana-only words or particles should not have brackets.
    `;

    try {
        const response = await fetch(new URL('/api/generate', url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false, // We want a single response object
                format: 'json', // Instruct Ollama to ensure the output is valid JSON
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Ollama API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        // The 'response' field from Ollama contains the full JSON string
        const parsedResult = JSON.parse(result.response);
        
        if (!parsedResult.wordDetails || !parsedResult.meaning || !Array.isArray(parsedResult.conversations)) {
            throw new Error("Invalid response structure from Ollama model.");
        }

        return parsedResult;

    } catch (error) {
        console.error("Error generating content from Ollama API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate learning content with Ollama: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Ollama API.");
    }
};
