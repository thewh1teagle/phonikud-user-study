import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

interface RatingInputProps {
  label: string; // e.g., "A", "B", "C", "D"
  sentenceId: string; // Unique sentence ID
  model: string; // Model name for uniqueness
  naturalness?: number;
  accuracy?: number;
  onNaturalnessChange: (value: number) => void;
  onAccuracyChange: (value: number) => void;
  className?: string;
}

export function RatingInput({
  label,
  sentenceId,
  model,
  naturalness,
  accuracy,
  onNaturalnessChange,
  onAccuracyChange,
  className
}: RatingInputProps) {
  const ratingOptions = [1, 2, 3, 4, 5];
  const uniqueId = `${sentenceId}-${model}`;

  return (
    <div className={cn("p-4 border rounded-lg bg-white space-y-6", className)}>
      <div className="text-xl font-bold text-center mb-2">דגימה {label}</div>
      
      {/* Naturalness Rating */}
      <div className="space-y-3">
        <Label className="text-base font-semibold block text-center">טבעיות הדיבור</Label>
        
        <div className="flex items-center justify-center gap-3" dir="rtl">
          <span className="text-xs text-slate-500 whitespace-nowrap">טבעי מאוד</span>
          <RadioGroup
            key={`${uniqueId}-naturalness-group`}
            value={naturalness?.toString() || undefined} 
            onValueChange={(value) => onNaturalnessChange(parseInt(value))}
            className="flex justify-center gap-4"
          >
            {ratingOptions.map((rating) => (
              <div key={`nat-${rating}`} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={rating.toString()} id={`${uniqueId}-nat-${rating}`} name={`${uniqueId}-naturalness`} />
                <Label htmlFor={`${uniqueId}-nat-${rating}`} className="cursor-pointer text-sm">
                  {rating}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <span className="text-xs text-slate-500 whitespace-nowrap">לא טבעי</span>
        </div>
      </div>

      {/* Accuracy Rating */}
      <div className="space-y-3">
        <Label className="text-base font-semibold block text-center">התאמה לטקסט</Label>
        
        <div className="flex items-center justify-center gap-3" dir="rtl">
          <span className="text-xs text-slate-500 whitespace-nowrap">תואם מאוד</span>
          <RadioGroup
            key={`${uniqueId}-accuracy-group`}
            value={accuracy?.toString() || undefined} 
            onValueChange={(value) => onAccuracyChange(parseInt(value))}
            className="flex justify-center gap-4"
          >
            {ratingOptions.map((rating) => (
              <div key={`acc-${rating}`} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={rating.toString()} id={`${uniqueId}-acc-${rating}`} name={`${uniqueId}-accuracy`} />
                <Label htmlFor={`${uniqueId}-acc-${rating}`} className="cursor-pointer text-sm">
                  {rating}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <span className="text-xs text-slate-500 whitespace-nowrap">לא תואם</span>
        </div>
      </div>
    </div>
  );
}
