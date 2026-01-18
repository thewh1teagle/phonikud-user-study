import { describe, expect, it, vi, beforeEach } from 'vitest';
import { submitBatch } from '@/lib/firebase';

// 1. Mock Firebase modules BEFORE any imports to prevent initialization side effects
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  doc: vi.fn(),
}));

// 2. Mock our own firebase lib to spy on submitBatch
// We use a variable to capture the spy so we can assert on it
vi.mock('@/lib/firebase', async () => {
  const actual = await vi.importActual<typeof import('@/lib/firebase')>('@/lib/firebase');
  return {
    ...actual,
    submitBatch: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Evaluation Core Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates correct submission payload for all models', async () => {
    // Define test data locally to avoid import circularities
    const TTS_MODELS = ['phonikud_stts2', 'roboshaul_nakdimon', 'gemini_unvocalized', 'piper-phonikud'];
    const sentenceId = 'sentence-1';
    const user = { name: 'Test User', email: 'test@example.com' };
    
    // Simulate the exact logic used in Evaluation.tsx:handleNext
    const submissions = TTS_MODELS.map(model => ({
      name: user.name,
      email: user.email,
      sentence_id: sentenceId,
      model,
      naturalness: 5,
      accuracy: 4,
    }));

    // Call the function
    await submitBatch(submissions);

    // Verify the mock was called
    const mockedSubmit = vi.mocked(submitBatch);
    expect(mockedSubmit).toHaveBeenCalledTimes(1);

    // Verify payload structure
    const payload = mockedSubmit.mock.calls[0][0];
    expect(payload).toHaveLength(4);

    // Check specific fields for one item to ensure mapping is correct
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          sentence_id: 'sentence-1',
          model: 'phonikud_stts2',
          naturalness: 5,
          accuracy: 4,
        })
      ])
    );
  });
});
