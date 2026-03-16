"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export interface StepperInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  inputClass: string;
}

export function StepperInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  disabled,
  inputClass,
}: StepperInputProps) {
  const numVal = parseFloat(value);

  const nudge = (dir: 1 | -1) => {
    const current = isNaN(numVal) ? (dir === 1 ? min : max) : numVal;
    const next = parseFloat((current + dir * step).toFixed(10));
    if (next < min || next > max) return;
    onChange(String(next));
  };

  return (
    <div className="relative">
      {/* Hide native spinners across all browsers */}
      <style>{`
        input[type=number].no-spinner::-webkit-inner-spin-button,
        input[type=number].no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number].no-spinner { -moz-appearance: textfield; }
      `}</style>

      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${inputClass} no-spinner pr-7`}
      />

      {/* Custom ▲▼ buttons */}
      <div className="absolute right-0 bottom-0 flex flex-col" style={{ height: "calc(100% - 2px)" }}>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || (!isNaN(numVal) && numVal >= max)}
          onClick={() => nudge(1)}
          className="flex-1 flex items-center justify-center px-1.5 text-[#c4a882] hover:text-[#1a1714] hover:bg-[#d4b896]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-l border-[#c4a882]/20"
        >
          <ChevronUp size={11} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || (!isNaN(numVal) && numVal <= min)}
          onClick={() => nudge(-1)}
          className="flex-1 flex items-center justify-center px-1.5 text-[#c4a882] hover:text-[#1a1714] hover:bg-[#d4b896]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-l border-t border-[#c4a882]/20"
        >
          <ChevronDown size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
