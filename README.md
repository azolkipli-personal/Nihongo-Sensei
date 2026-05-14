# Nihongo Sensei (会話練習)

## Why

Japanese learners hit a wall between "knowing words" and "using words." You memorise vocabulary from WaniKani or Anki, but when it's time to actually speak — in a meeting, at a conbini, with colleagues — the words don't come out naturally. The problem isn't your memory. It's that you've never seen those words in real conversation context. Flashcards show you isolated words. You need to see how they flow together in actual dialogue.

## What

Nihongo Sensei is a conversation-practice app that generates realistic Japanese dialogues from your vocabulary list. Give it a list of words and a scenario — "casual chat with coworkers" or "ordering at a restaurant" — and it produces natural conversations showing exactly how those words are used in context. Every word gets furigana pronunciation guides, romaji, and English translations.

This was the predecessor to [nihongo-master](https://github.com/azolkipli-personal/nihongo-master) — the spiritual v1 that proved the concept before evolving into a full-featured learning platform.

## Features

- **Contextual dialogue generation** — 5 distinct conversation examples per word, within a user-defined scenario
- **Rich vocabulary display** — Kanji, kana, romaji, and English meaning for every word
- **Interactive furigana** — Toggle pronunciation guides on/off during practice
- **Flexible input** — Type words manually or upload a `.txt` vocabulary list
- **Customisable AI backend** — Works with Google Gemini (cloud) or Ollama (local, private)
- **Practice mode** — Independently show/hide romaji and English to test comprehension
- **Session management** — Export results to JSON for later review

## Quick Start

Open `index.html` in a browser, or serve with any static file server:

```bash
git clone https://github.com/azolkipli-personal/Nihongo-Sensei
cd Nihongo-Sensei
python3 -m http.server 8080
# Open http://localhost:8080
```

Configure your AI backend in Settings (⚙️):
- **Google Gemini**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Ollama**: Install [Ollama](https://ollama.com/) locally and run `ollama pull llama3`

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (single-page app)
- **AI Backends**: Google Gemini API (`@google/genai`), Ollama (local REST API)
- **Storage**: Browser localStorage (API keys, session data)
