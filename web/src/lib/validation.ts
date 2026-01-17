/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate name (minimum 2 characters)
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

/**
 * Validate rating (must be integer between 1 and 5)
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Validate that all ratings for a sentence are complete
 * Each sentence requires 4 models × 2 ratings (naturalness + accuracy) = 8 total ratings
 */
export function areSentenceRatingsComplete(
  sentenceId: string,
  models: string[],
  ratings: Array<{ sentenceId: string; model: string; naturalness?: number; accuracy?: number }>
): boolean {
  const sentenceRatings = ratings.filter(r => r.sentenceId === sentenceId);
  
  // Check that we have ratings for all models
  return models.every(model => {
    const modelRating = sentenceRatings.find(r => r.model === model);
    return modelRating && 
           isValidRating(modelRating.naturalness) && 
           isValidRating(modelRating.accuracy);
  });
}
