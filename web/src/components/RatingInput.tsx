import { Button } from './ui/button';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

interface RatingInputProps {
  naturalness?: number;
  accuracy?: number;
  onNaturalnessChange: (value: number) => void;
  onAccuracyChange: (value: number) => void;
  className?: string;
}

const CMOS_OPTIONS = [
  { value: 3,  label: 'A הרבה יותר טוב' },
  { value: 2,  label: 'A יותר טוב' },
  { value: 1,  label: 'A קצת יותר טוב' },
  { value: 0,  label: 'דומה' },
  { value: -1, label: 'B קצת יותר טוב' },
  { value: -2, label: 'B יותר טוב' },
  { value: -3, label: 'B הרבה יותר טוב' },
] as const;

function CmosScale({
  title,
  value,
  onChange
}: {
  title: string;
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold block text-center">{title}</Label>
      <div className="flex flex-col gap-1.5 max-w-sm mx-auto">
        {CMOS_OPTIONS.map(option => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "w-full justify-center text-sm h-9",
              value === option.value && "ring-2 ring-offset-1 ring-slate-900",
              option.value === 0 && value !== 0 && "border-dashed"
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function RatingInput({
  naturalness,
  accuracy,
  onNaturalnessChange,
  onAccuracyChange,
  className
}: RatingInputProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-8", className)}>
      <CmosScale
        title="מה נשמע יותר טבעי?"
        value={naturalness}
        onChange={onNaturalnessChange}
      />
      <CmosScale
        title="מה יותר תואם לטקסט?"
        value={accuracy}
        onChange={onAccuracyChange}
      />
    </div>
  );
}
