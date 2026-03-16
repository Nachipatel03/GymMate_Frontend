import React from "react";
import { Check } from "lucide-react";

export function Checkbox({ checked, onCheckedChange, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`w-5 h-5 rounded border flex items-center justify-center transition
        ${checked ? "bg-emerald-500 border-emerald-500" : "border-slate-600"}
        ${className}
      `}
    >
      {checked && <Check className="w-4 h-4 text-white" />}
    </button>
  );
}
