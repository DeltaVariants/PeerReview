'use client';

import { RATING_LABELS, RATING_MAX, RATING_MIN } from '@/lib/criteria';

type RatingScaleProps = {
  label: string;
  value?: number;
  onChange: (value: number) => void;
};

export function RatingScale({ label, value, onChange }: RatingScaleProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {typeof value === 'number' ? (
          <span className="text-sm text-blue-700 font-semibold whitespace-nowrap">
            {value} – {RATING_LABELS[value - 1]}
          </span>
        ) : (
          <span className="text-sm text-gray-500 whitespace-nowrap">Chưa chọn</span>
        )}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, index) => {
          const score = index + RATING_MIN;
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-label={`${score} ${RATING_LABELS[index]}`}
              aria-pressed={selected}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition ${
                selected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400'
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
}
