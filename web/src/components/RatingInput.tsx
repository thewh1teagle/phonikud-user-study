import { Slider } from './ui/slider';
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

function getLabel(value: number): string {
  return CMOS_OPTIONS.find(o => o.value === value)?.label ?? '';
}

function CmosScale({
  title,
  value,
  onChange
}: {
  title: string;
  value?: number;
  onChange: (v: number) => void;
}) {
  const hasValue = value !== undefined;

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold block text-center">{title}</Label>
      <div className="max-w-sm mx-auto space-y-3">
        {/* Current selection label */}
        <div className="text-center text-sm font-medium h-5">
          {hasValue ? getLabel(value) : ''}
        </div>

        {/* Slider */}
        <Slider
          dir="ltr"
          min={-3}
          max={3}
          step={1}
          value={hasValue ? [value] : [0]}
          onValueChange={([v]) => onChange(v)}
          className={cn(!hasValue && "opacity-40")}
        />

        {/* Tick marks and end labels */}
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground text-center w-16">A יותר טוב</span>
          <div className="flex-1 flex justify-between px-1">
            {CMOS_OPTIONS.map((_, i) => (
              <div key={i} className="w-0.5 h-1.5 bg-slate-300 rounded-full" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground text-center w-16">B יותר טוב</span>
        </div>
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
