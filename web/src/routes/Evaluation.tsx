import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { useSurvey } from '../contexts/SurveyContext';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import { useLocalStorage, useAutoSave } from '../hooks/useLocalStorage';
import { useSingleAudioPlayer } from '../hooks/useSingleAudioPlayer';
import { loadSentences, TTS_MODELS } from '../lib/sentences';
import { submitBatch } from '../lib/firebase';
import type { Sentence } from '../types/survey';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { SentenceCard } from '../components/SentenceCard';
import { AudioPlayer } from '../components/AudioPlayer';
import { RatingInput } from '../components/RatingInput';

export default function Evaluation() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const { surveyState, setCurrentSentenceIndex, updateRating, markSentenceAsSubmitted, completeSurvey } = useSurvey();
  const { saveToStorage } = useLocalStorage(userData?.sessionId || null);
  const { registerAudio } = useSingleAudioPlayer();
  
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playedAudio, setPlayedAudio] = useState<Set<string>>(new Set());

  // Load sentences on mount
  useEffect(() => {
    loadSentences()
      .then(setSentences)
      .catch(error => {
        console.error('Error loading sentences:', error);
        alert('שגיאה בטעינת המשפטים');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-save to localStorage on state change
  useAutoSave(
    { userData, surveyState },
    (data) => {
      if (data.userData) {
        saveToStorage({
          userData: data.userData,
          surveyState: data.surveyState,
          lastUpdated: new Date().toISOString()
        });
      }
    },
    500
  );

  const { 
    progressPercentage, 
    canGoPrevious, 
    isLastSentence,
    currentSentenceId
  } = useSurveyProgress(
    surveyState.currentSentenceIndex,
    userData?.sentenceOrder.length || 0,
    surveyState.ratings,
    userData?.sentenceOrder || [],
    [...TTS_MODELS]
  );

  // Reset played audio when sentence changes
  useEffect(() => {
    setPlayedAudio(new Set());
  }, [currentSentenceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" dir="rtl">טוען משפטים...</div>
      </div>
    );
  }

  if (!userData || !sentences.length) {
    navigate('/');
    return null;
  }

  const currentSentenceData = sentences.find(s => s.id === currentSentenceId);
  const currentModelShuffle = surveyState.modelShuffles.find(
    m => m.sentenceId === currentSentenceId
  );

  // Check if all audio for current sentence has been played
  const allAudioPlayed = currentModelShuffle 
    ? currentModelShuffle.modelOrder.every(model => 
        playedAudio.has(`${currentSentenceId}-${model}`)
      )
    : false;

  if (!currentSentenceData || !currentModelShuffle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600" dir="rtl">שגיאה בטעינת נתונים</div>
      </div>
    );
  }

  const handleNext = async () => {
    if (!allAudioPlayed || !currentSentenceId) return;

    // Check if this sentence hasn't been submitted yet
    if (!surveyState.submittedSentences.includes(currentSentenceId)) {
      setIsSubmitting(true);
      
      try {
        // Prepare submissions for all 4 models
        const submissions = currentModelShuffle.modelOrder.map(model => {
          const rating = surveyState.ratings.find(
            r => r.sentenceId === currentSentenceId && r.model === model
          );
          
          return {
            name: userData.name,
            email: userData.email,
            sentence_id: currentSentenceId,
            model,
            naturalness: rating?.naturalness || 3,
            accuracy: rating?.accuracy || 3
          };
        });

        // Submit to Firebase
        await submitBatch(submissions);
        
        // Mark as submitted
        markSentenceAsSubmitted(currentSentenceId);
        
        console.log(`Submitted ratings for sentence ${currentSentenceId}`);
      } catch (error) {
        console.error('Error submitting ratings:', error);
        alert('שגיאה בשמירת הנתונים. נא לנסות שוב.');
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Navigate to next sentence or complete survey
    if (isLastSentence) {
      completeSurvey();
      navigate('/thank-you');
    } else {
      setCurrentSentenceIndex(surveyState.currentSentenceIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (!canGoPrevious) return;
    setCurrentSentenceIndex(surveyState.currentSentenceIndex - 1);
    window.scrollTo(0, 0);
  };

  const handleRatingChange = (model: string, field: 'naturalness' | 'accuracy', value: number) => {
    updateRating(currentSentenceId, model, { [field]: value });
  };

  const handleAudioPlayed = (model: string) => {
    setPlayedAudio(prev => new Set(prev).add(`${currentSentenceId}-${model}`));
    
    // Ensure rating exists with default values when audio is played
    const existingRating = surveyState.ratings.find(
      r => r.sentenceId === currentSentenceId && r.model === model
    );
    
    if (!existingRating) {
      updateRating(currentSentenceId, model, { 
        naturalness: 3, 
        accuracy: 3 
      });
    }
  };

  const getModelRating = (model: string) => {
    const rating = surveyState.ratings.find(
      r => r.sentenceId === currentSentenceId && r.model === model
    );
    // Return rating if exists, otherwise return default values
    return rating || { sentenceId: currentSentenceId, model, naturalness: 3, accuracy: 3 };
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" dir="rtl">
              משפט {surveyState.currentSentenceIndex + 1} מתוך {userData.sentenceOrder.length}
            </span>
            <span className="text-sm text-slate-600">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Sentence Display */}
        <SentenceCard text={currentSentenceData.text} />

        {/* Instructions */}
        <div className="text-center text-slate-600" dir="rtl">
          <p>האזינו לכל דגימה ודרגו את טבעיות הדיבור ודיוק ההגייה</p>
        </div>

        {/* Audio Players and Ratings */}
        <div className="grid gap-6">
          {currentModelShuffle.modelOrder.map((model, index) => {
            const label = String.fromCharCode(65 + index); // A, B, C, D
            const audioSrc = `${import.meta.env.BASE_URL}audio/${model}/${currentSentenceId}.m4a`;
            const rating = getModelRating(model);

            return (
              <div key={model} className="space-y-3">
                <AudioPlayer 
                  audioSrc={audioSrc} 
                  label={label}
                  onPlayed={() => handleAudioPlayed(model)}
                  onAudioRef={registerAudio}
                />
                <RatingInput
                  label={label}
                  naturalness={rating.naturalness}
                  accuracy={rating.accuracy}
                  onNaturalnessChange={(value) => handleRatingChange(model, 'naturalness', value)}
                  onAccuracyChange={(value) => handleRatingChange(model, 'accuracy', value)}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious || isSubmitting}
          >
            ← הקודם
          </Button>

          <Button
            onClick={handleNext}
            disabled={!allAudioPlayed || isSubmitting}
          >
            {isSubmitting ? 'שומר...' : isLastSentence ? 'סיים' : 'הבא →'}
          </Button>
        </div>

        {/* Warning if not complete */}
        {!allAudioPlayed && (
          <div className="text-center text-sm text-amber-600" dir="rtl">
            נא להאזין לכל הדגימות לפני המעבר למשפט הבא
          </div>
        )}
      </div>
    </div>
  );
}
