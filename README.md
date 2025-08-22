# Kaiwa Renshuu (会話練習)

Kaiwa Renshuu (Conversation Practice) is a web-based application designed to help Japanese language learners master new vocabulary and phrases by providing rich, contextual examples. Instead of just giving a definition, this tool generates realistic conversation dialogues based on a scenario you provide, showing you how words are used naturally.

## ✨ Features

*   **Contextual Learning**: Generates 5 distinct conversation examples for each word or phrase within a user-defined scenario (e.g., "work conversations in an IT engineering company").
*   **Detailed Vocabulary**: Provides the Kanji, Kana (Hiragana/Katakana), and Romaji for each word, along with a clear English meaning.
*   **Interactive Furigana**: All Japanese dialogue includes furigana (pronunciation guides over Kanji), which can be crucial for learners.
*   **Flexible Input**:
    *   **Manual Entry**: Quickly look up one or more words by typing them in (separated by commas or newlines).
    *   **File Upload**: Process an entire vocabulary list at once by uploading a `.txt` file.
*   **Customizable LLM Backend**:
    *   **Google Gemini**: Use the powerful Gemini models by providing your own API key.
    *   **Ollama (Local)**: Connect to a local Ollama instance to use models like Llama 3, Mistral, etc., for offline and private generation.
*   **Practice Mode**: Test your comprehension by independently hiding or showing the Romaji and English translations for the conversation dialogues.
*   **Session Management**:
    *   **Export**: Save your generated results (for one or multiple words) to a single JSON file.
    *   **Review**: Load previously saved JSON files to review your study sessions anytime.

## 🚀 How to Use

This is a client-side application that can be run directly in a web browser, making it easy to deploy on platforms like GitHub Pages.

### 1. Initial Setup: Configure Your Language Model

Before you start generating, you need to configure a language model.

1.  Click the **gear icon (⚙️)** in the top-right corner to open the **Settings** sidebar.
2.  Choose your preferred service: **Google Gemini** or **Ollama**.

#### For Google Gemini:
1.  Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  In the settings sidebar, paste your key into the "Google Gemini API Key" field.
3.  Choose your desired Gemini model from the dropdown.
4.  Click "Save and Close". Your key is stored securely in your browser's local storage and is never sent anywhere else.

#### For Ollama (Local):
1.  Ensure you have [Ollama](https://ollama.com/) installed and running on your computer.
2.  Make sure you have downloaded a model (e.g., run `ollama pull llama3` in your terminal).
3.  In the settings sidebar, verify the "Ollama Server URL" (the default `http://localhost:11434` is usually correct).
4.  Click "Fetch Models" to see a list of your installed models.
5.  Select a model from the dropdown.
6.  Click "Save and Close".

### 2. Generating Examples

1.  On the **Generator** page, choose your input method:
    *   **Manual Entry**: Type or paste words/phrases into the text area.
    *   **File Upload**: Upload a `.txt` file containing your vocabulary list.
2.  Verify or change the **Scenario / Context** to match your learning goals.
3.  Click **Generate Examples**. The app will process each word and display the results.
4.  For long lists, a **Stop Generation** button will appear if you need to cancel the process.

### 3. Reviewing Your Session

*   Use the **"Show: Romaji / English"** buttons to toggle translations for practice.
*   Click **Export All Results** to save your entire session as a single `.json` file.
*   Navigate to the **Review** page to upload and view your saved `.json` files at any time.

## 🛠️ Technologies Used

*   **Frontend**: React.js
*   **Styling**: Tailwind CSS
*   **Language Models**:
    *   `@google/genai` for Google Gemini API integration
    *   Direct API calls to a local Ollama instance
