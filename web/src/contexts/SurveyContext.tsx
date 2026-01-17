import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { SurveyState, Rating, ModelShuffle } from '../types/survey';

interface SurveyContextType {
  surveyState: SurveyState;
  setCurrentSentenceIndex: (index: number) => void;
  addRating: (rating: Rating) => void;
  updateRating: (sentenceId: string, model: string, updates: Partial<Rating>) => void;
  setModelShuffles: (shuffles: ModelShuffle[]) => void;
  markSentenceAsSubmitted: (sentenceId: string) => void;
  completeSurvey: () => void;
  resetSurvey: () => void;
  getRating: (sentenceId: string, model: string) => Rating | undefined;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

const initialState: SurveyState = {
  currentSentenceIndex: 0,
  ratings: [],
  modelShuffles: [],
  isComplete: false,
  submittedSentences: []
};

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [surveyState, setSurveyState] = useState<SurveyState>(initialState);

  const setCurrentSentenceIndex = (index: number) => {
    setSurveyState(prev => ({ ...prev, currentSentenceIndex: index }));
  };

  const addRating = (rating: Rating) => {
    setSurveyState(prev => ({
      ...prev,
      ratings: [...prev.ratings, rating]
    }));
  };

  const updateRating = (sentenceId: string, model: string, updates: Partial<Rating>) => {
    setSurveyState(prev => {
      const existingIndex = prev.ratings.findIndex(
        r => r.sentenceId === sentenceId && r.model === model
      );

      if (existingIndex >= 0) {
        // Update existing rating
        const newRatings = [...prev.ratings];
        newRatings[existingIndex] = { ...newRatings[existingIndex], ...updates };
        return { ...prev, ratings: newRatings };
      } else {
        // Add new rating
        return {
          ...prev,
          ratings: [...prev.ratings, { sentenceId, model, ...updates }]
        };
      }
    });
  };

  const setModelShuffles = (shuffles: ModelShuffle[]) => {
    setSurveyState(prev => ({ ...prev, modelShuffles: shuffles }));
  };

  const markSentenceAsSubmitted = (sentenceId: string) => {
    setSurveyState(prev => ({
      ...prev,
      submittedSentences: [...prev.submittedSentences, sentenceId]
    }));
  };

  const completeSurvey = () => {
    setSurveyState(prev => ({ ...prev, isComplete: true }));
  };

  const resetSurvey = () => {
    setSurveyState(initialState);
  };

  const getRating = (sentenceId: string, model: string): Rating | undefined => {
    return surveyState.ratings.find(
      r => r.sentenceId === sentenceId && r.model === model
    );
  };

  return (
    <SurveyContext.Provider
      value={{
        surveyState,
        setCurrentSentenceIndex,
        addRating,
        updateRating,
        setModelShuffles,
        markSentenceAsSubmitted,
        completeSurvey,
        resetSurvey,
        getRating
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}
