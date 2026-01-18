import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

interface RatingInputProps {
  idPrefix: string;
  naturalness?: number;
  accuracy?: number;
  onNaturalnessChange: (value: number) => void;
  onAccuracyChange: (value: number) => void;
  className?: string;
}

interface ScaleRowProps {
  idPrefix: string;
  title: string;
  value?: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}

const ratingOptions = [1, 2, 3, 4, 5];

function ScaleRow({ idPrefix, title, value, onChange, leftLabel, rightLabel }: ScaleRowProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold block text-center">{title}</Label>

      <div className="flex items-center justify-center gap-3" dir="rtl">
        <span className="text-xs text-slate-500 whitespace-nowrap">{leftLabel}</span>
        <RadioGroup
          key={`${idPrefix}-group`}
          value={value?.toString() || undefined}
          onValueChange={(next) => onChange(parseInt(next))}
          className="flex justify-center gap-4"
        >
          {ratingOptions.map((rating) => {
            const itemId = `${idPrefix}-${rating}`;
            return (
              <div key={itemId} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={rating.toString()} id={itemId} />
                <Label htmlFor={itemId} className="cursor-pointer text-sm">
                  {rating}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        <span className="text-xs text-slate-500 whitespace-nowrap">{rightLabel}</span>
      </div>
    </div>
  );
}

export function RatingInput({
  idPrefix,
  naturalness,
  accuracy,
  onNaturalnessChange,
  onAccuracyChange,
  className
}: RatingInputProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <ScaleRow
        idPrefix={`${idPrefix}-naturalness`}
        title="טבעיות הדיבור"
        value={naturalness}
        onChange={onNaturalnessChange}
        leftLabel="טבעי מאוד"
        rightLabel="לא טבעי"
      />
      <ScaleRow
        idPrefix={`${idPrefix}-accuracy`}
        title="התאמה לטקסט"
        value={accuracy}
        onChange={onAccuracyChange}
        leftLabel="תואם מאוד"
        rightLabel="לא תואם"
      />
    </div>
  );
}
