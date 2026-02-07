import { describe, expect, it } from 'vitest';
import { calculateStats } from '@/lib/firebase';

describe('calculateStats', () => {
  it('computes CMOS mean and confidence intervals', () => {
    const submissions = [
      { name: 'A', email: 'a@example.com', sentence_id: 's1', model_a: 'm1', model_b: 'm2', naturalness_cmos: 2, accuracy_cmos: -1 },
      { name: 'B', email: 'b@example.com', sentence_id: 's2', model_a: 'm1', model_b: 'm2', naturalness_cmos: 1, accuracy_cmos: 0 },
      { name: 'C', email: 'c@example.com', sentence_id: 's3', model_a: 'm1', model_b: 'm2', naturalness_cmos: 3, accuracy_cmos: -2 },
    ];

    const stats = calculateStats(submissions);
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(3);
    expect(stats!.meanNaturalness).toBeCloseTo(2, 5);
    expect(stats!.meanAccuracy).toBeCloseTo(-1, 5);
    expect(stats!.ciNaturalness).toBeGreaterThan(0);
    expect(stats!.ciAccuracy).toBeGreaterThan(0);
  });

  it('returns null for empty submissions', () => {
    expect(calculateStats([])).toBeNull();
  });
});
