export interface DialogueLine {
  speaker: string;
  japanese: string; // Will contain furigana formatting, e.g., "今日[きょう]は"
  romaji: string;
  english: string;
}

export interface Conversation {
  title: string;
  dialogue: DialogueLine[];
}

export interface WordDetails {
  kanji: string;  // The word itself, could contain kanji or be kana
  kana: string;   // The pure hiragana/katakana reading
  romaji: string; // The romaji representation
}

export interface LearningResult {
  wordDetails: WordDetails;
  meaning: string;
  conversations: Conversation[];
}