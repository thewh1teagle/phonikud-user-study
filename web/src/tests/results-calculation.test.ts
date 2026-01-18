import { describe, expect, it } from 'vitest';
import { calculateStats } from '@/lib/firebase';

describe('calculateStats', () => {
  it('computes per-model counts and averages', () => {
    const submissions = [
      { name: 'A', email: 'a@example.com', sentence_id: 's1', model: 'm1', naturalness: 5, accuracy: 4 },
      { name: 'B', email: 'b@example.com', sentence_id: 's2', model: 'm1', naturalness: 3, accuracy: 2 },
      { name: 'C', email: 'c@example.com', sentence_id: 's1', model: 'm2', naturalness: 4, accuracy: 5 },
    ];

    const stats = calculateStats(submissions);
    const m1 = stats.find((item) => item.model === 'm1');
    const m2 = stats.find((item) => item.model === 'm2');

    expect(m1).toMatchObject({
      model: 'm1',
      count: 2,
      meanNaturalness: 4,
      meanAccuracy: 3,
    });

    expect(m2).toMatchObject({
      model: 'm2',
      count: 1,
      meanNaturalness: 4,
      meanAccuracy: 5,
    });
  });
});
