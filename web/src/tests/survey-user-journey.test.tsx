import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Welcome from '@/routes/Welcome';
import Evaluation from '@/routes/Evaluation';
import ThankYou from '@/routes/ThankYou';
import { UserProvider } from '@/contexts/UserContext';
import { SurveyProvider } from '@/contexts/SurveyContext';
import { submitBatch } from '@/lib/firebase';
import type { Submission } from '@/lib/firebase';

// --- Mocks ---

// 1. Mock Firebase (prevent network calls)
vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(), collection: vi.fn(), addDoc: vi.fn(), getDocs: vi.fn(), doc: vi.fn(),
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) })),
}));
vi.mock('@/lib/firebase', async () => {
  const actual = await vi.importActual<typeof import('@/lib/firebase')>('@/lib/firebase');
  return { ...actual, submitBatch: vi.fn().mockResolvedValue(undefined) };
});

// 2. Mock Sentences (Load only 2 sentences for speed)
vi.mock('@/lib/sentences', () => ({
  loadSentences: vi.fn().mockResolvedValue([
    { id: 's1', text: 'Sentence One' },
    { id: 's2', text: 'Sentence Two' }
  ]),
  TTS_MODELS: ['m1', 'm2', 'm3', 'm4'],
}));

// Define constants for use in test assertions (must match mock above)
const MOCK_SENTENCES = [
  { id: 's1', text: 'Sentence One' },
  { id: 's2', text: 'Sentence Two' }
];
const MOCK_MODELS = ['m1', 'm2', 'm3', 'm4'];

// 3. Mock Helpers (Stop timeouts/scrolls)
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => ({ saveToStorage: vi.fn(), loadFromStorage: vi.fn(() => null), clearStorage: vi.fn() }),
  useAutoSave: () => {}, // Critical: Prevents hanging timers
}));
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });

// --- Test ---

describe('Full Survey Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes the entire survey flow with random answers', async () => {
    // Setup App with Routes
    render(
      <MemoryRouter initialEntries={['/']}>
        <UserProvider>
          <SurveyProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/thank-you" element={<ThankYou />} />
            </Routes>
          </SurveyProvider>
        </UserProvider>
      </MemoryRouter>
    );

    // 1. Welcome Screen
    await screen.findByText(/ברוכים הבאים/i);
    
    // Fill User Info
    fireEvent.change(screen.getByLabelText(/שם מלא/i), { target: { value: 'Random Tester' } });
    fireEvent.change(screen.getByLabelText(/אימייל/i), { target: { value: 'random@test.com' } });
    // Click "Yes" for native speaker (using the radio input directly or label)
    const yesRadio = screen.getByLabelText('כן');
    fireEvent.click(yesRadio);

    // Click Start
    fireEvent.click(screen.getByRole('button', { name: /התחל/i }));

    // 2. Evaluation Loop (Simulate answering all sentences)
    // Since order is shuffled, we don't know which comes first.
    // We just need to repeat the process for however many sentences we have.
    for (let i = 0; i < MOCK_SENTENCES.length; i++) {
      // Wait for ANY sentence text to appear
      // We might find multiple because the text is displayed in each card.
      // We just need to know WHICH sentence we are on.
      const sentenceElements = await screen.findAllByText(/Sentence (One|Two)/);
      const currentText = sentenceElements[0].textContent;
      
      // For each model (A, B, C, D)
      const models = ['A', 'B', 'C', 'D']; // UI labels
      for (const label of models) {
        // Find the card for this model by its label
        const header = screen.getByText(`דגימה ${label}`);
        // The card is the container. We can use closest to find the white background card
        const modelCard = header.closest('.bg-white');
        if (!modelCard) throw new Error(`Model card ${label} not found`);

        // Within this card, we have 2 rows of ratings.
        // Row 1: Naturalness. Row 2: Accuracy.
        // We can just find all radio buttons for a specific score (e.g., "3") inside this card.
        // There will be two "3"s: one for naturalness, one for accuracy.
        // We click both to ensure complete rating.
        
        const randomScore = Math.floor(Math.random() * 5) + 1; // 1-5
        
        // Find the inputs for this score. 
        // Note: getAllByLabelText returns the INPUT elements because of how Radix/Headless UI often works, 
        // or the Label associated with them.
        // In our setup, RatingInput uses Radix UI RadioGroup. 
        // The Label points to the button.
        const radios = within(modelCard as HTMLElement).getAllByLabelText(randomScore.toString());
        
        // We expect 2 radios (Naturalness and Accuracy) for this score in this card
        // If we picked a random score, we might get different ones, but let's just pick "3" for simplicity 
        // and click both occurrences to fill both rows.
        // Or better: iterate 1..5, find the one we want.
        
        if (radios.length < 2) {
           // If we didn't find 2, maybe we need to look for different scores?
           // Let's simplifiy: Always click "5" for Naturalness and "4" for Accuracy.
           const natRadios = within(modelCard as HTMLElement).getAllByLabelText('5');
           fireEvent.click(natRadios[0]); // First one is Naturalness (DOM order)
           
           const accRadios = within(modelCard as HTMLElement).getAllByLabelText('4');
           // If the first one is Naturalness, we need to be careful.
           // Searching for '4' might return Naturalness-4 and Accuracy-4.
           // Since we clicked '5' for Naturalness, Naturalness-4 is unselected.
           // DOM order: Naturalness Group comes first.
           fireEvent.click(accRadios[1] || accRadios[0]); 
           // If there is only 1 '4' (because naturalness selected 5), it might be the Accuracy one.
           // Actually, let's just be specific with IDs if possible?
           // No, IDs are random.
           
           // Robust fallback:
           // Get all radio items in the card.
           // The first 5 are Naturalness (1-5). The next 5 are Accuracy (1-5).
           const allRadios = within(modelCard as HTMLElement).getAllByRole('radio');
           // 0-4 are Nat, 5-9 are Acc.
           
           // Click a random one in first group
           fireEvent.click(allRadios[Math.floor(Math.random() * 5)]);
           
           // Click a random one in second group
           fireEvent.click(allRadios[5 + Math.floor(Math.random() * 5)]);
        } else {
            // If the simple logic worked (unlikely to be robust with random)
            fireEvent.click(radios[0]);
            fireEvent.click(radios[1]);
        }
      }

      // Click Next / Finish
      const nextBtn = screen.getByRole('button', { name: /הבא|סיים/i });
      await waitFor(() => expect(nextBtn).toBeEnabled());
      fireEvent.click(nextBtn);
      
      if (i === MOCK_SENTENCES.length - 1) {
         // It's the last one, wait for submission
         await waitFor(() => expect(vi.mocked(submitBatch)).toHaveBeenCalled());
      } else {
         // Wait for the current sentence to disappear (transition to next)
         await waitFor(() => {
            const newText = screen.queryByText(currentText!);
            expect(newText).not.toBeInTheDocument();
         });
      }
    }

    // 3. Verify Submission
    // submitBatch is called PER SENTENCE. So we expect 2 calls, each with 4 items.
    const calls = vi.mocked(submitBatch).mock.calls;
    expect(calls).toHaveLength(MOCK_SENTENCES.length);
    
    // Flatten all submissions to check total count and data
    const allSubmissions = calls.flatMap(call => call[0] as Submission[]);
    expect(allSubmissions).toHaveLength(MOCK_SENTENCES.length * MOCK_MODELS.length);
    
    // Verify one random submission has correct user data
    expect(allSubmissions[0]).toMatchObject({
      name: 'Random Tester',
      email: 'random@test.com',
      sentence_id: expect.stringMatching(/s[1-2]/),
      naturalness: expect.any(Number),
      accuracy: expect.any(Number)
    });

    // 4. Verify Thank You Page
    await screen.findByText(/תודה רבה על השתתפותך/i);
  });
});
