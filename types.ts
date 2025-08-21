
export interface DialogueLine {
  speaker: string;
  japanese: string;
  romaji: string;
  english: string;
}

export interface Conversation {
  title: string;
  dialogue: DialogueLine[];
}

export interface LearningResult {
  meaning: string;
  reading: string;
  conversations: Conversation[];
}
