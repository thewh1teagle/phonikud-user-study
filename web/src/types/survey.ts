export interface UserData {
  name: string;
  email: string;
  isNativeSpeaker: boolean;
  sessionId: string;
  sentenceOrder: string[]; // Shuffled sentence IDs
  comments?: string; // Optional feedback from user
}

export interface Rating {
  sentenceId: string;
  model: string; // e.g., "phonikud", "nakdimon", "google", "azure"
  naturalness?: number; // 1-5
  accuracy?: number; // 1-5
}

export interface ModelShuffle {
  sentenceId: string;
  modelOrder: string[]; // Shuffled model names for this sentence
}

export interface SurveyState {
  currentSentenceIndex: number;
  ratings: Rating[]; // All ratings collected so far
  modelShuffles: ModelShuffle[]; // Per-sentence model orders
  isComplete: boolean;
  submittedSentences: string[]; // IDs of sentences already submitted to Firebase
}

export interface Sentence {
  id: string;
  text: string;
}

export interface LocalStorageData {
  userData: UserData;
  surveyState: SurveyState;
  lastUpdated: string; // ISO timestamp
}
