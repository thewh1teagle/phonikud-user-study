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

  // Warn before leaving if survey not complete
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (surveyState.isComplete) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [surveyState.isComplete]);

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

  // Check if all ratings are complete
  const allRatingsComplete = currentModelShuffle
    ? currentModelShuffle.modelOrder.every(model => {
        const rating = surveyState.ratings.find(
          r => r.sentenceId === currentSentenceId && r.model === model
        );
        return rating && rating.naturalness && rating.accuracy;
      })
    : false;

  if (!currentSentenceData || !currentModelShuffle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600" dir="rtl">שגיאה בטעינת נתונים</div>
      </div>
    );
  }

  const handleNext = async () => {
    if (!allRatingsComplete || !currentSentenceId) return;

    // Check if this sentence hasn't been submitted yet
    if (!surveyState.submittedSentences.includes(currentSentenceId)) {
      setIsSubmitting(true);
      
      try {
        // Prepare submissions for all 4 models
        const submissions = currentModelShuffle.modelOrder.map(model => {
          const rating = surveyState.ratings.find(
            r => r.sentenceId === currentSentenceId && r.model === model
          );
          
          if (!rating || !rating.naturalness || !rating.accuracy) {
            throw new Error('חסרות דירוגים עבור אחת הדגימות');
          }
          
          return {
            name: userData.name,
            email: userData.email,
            sentence_id: currentSentenceId,
            model,
            naturalness: rating.naturalness,
            accuracy: rating.accuracy
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

  const getModelRating = (model: string) => {
    return surveyState.ratings.find(
      r => r.sentenceId === currentSentenceId && r.model === model
    );
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

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200" dir="rtl">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">הנחיות לדירוג:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li><strong>טבעיות הדיבור:</strong> עד כמה הדיבור נשמע טבעי ודומה לדובר אנושי (טון, קצב, זרימה)</li>
              <li><strong>התאמה לטקסט:</strong> עד כמה האודיו משקף נכון את הטקסט (הגייה, ניקוד, דגשים)</li>
            </ul>
            <p className="text-slate-600 mt-3">האזינו לכל 4 הדגימות ודרגו כל אחת בנפרד.</p>
          </div>
        </div>

        {/* Audio Players and Ratings */}
        <div className="grid gap-6">
          {currentModelShuffle.modelOrder.map((model, index) => {
            const label = String.fromCharCode(65 + index); // A, B, C, D
            const audioSrc = `${import.meta.env.BASE_URL}audio/${model}/${currentSentenceId}.m4a`;
            const rating = getModelRating(model);

            return (
              <div key={`${currentSentenceId}-${model}`} className="space-y-3">
                {/* Text and Audio Player combined */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                  <div className="text-xs text-slate-500 mb-1 text-center" dir="rtl">
                    הטקסט:
                  </div>
                  <div className="text-lg font-medium text-center mb-3" dir="rtl">
                    {currentSentenceData.text}
                  </div>
                  
                  <AudioPlayer 
                    key={`audio-${currentSentenceId}-${model}`}
                    audioSrc={audioSrc} 
                    label={label}
                    onAudioRef={registerAudio}
                  />
                </div>
                
                <RatingInput
                  key={`rating-${currentSentenceId}-${model}`}
                  label={label}
                  sentenceId={currentSentenceId}
                  model={model}
                  naturalness={rating?.naturalness}
                  accuracy={rating?.accuracy}
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
            disabled={!allRatingsComplete || isSubmitting}
          >
            {isSubmitting ? 'שומר...' : isLastSentence ? 'סיים' : 'הבא →'}
          </Button>
        </div>

        {/* Warning if not complete */}
        {!allRatingsComplete && (
          <div className="text-center text-sm text-amber-600" dir="rtl">
            נא לדרג את כל הדגימות לפני המעבר למשפט הבא
          </div>
        )}
      </div>
    </div>
  );
}
