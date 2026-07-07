import type { FieldMeta, HeartDiseaseInput } from "@/lib/types";

interface FormFieldProps {
  field: FieldMeta;
  value: number | string;
  onChange: (name: keyof HeartDiseaseInput, value: number) => void;
  error?: string;
}

export default function FormField({ field, value, onChange, error }: FormFieldProps) {
  const baseInputClasses = `
    w-full rounded-lg px-3.5 py-2.5 text-sm
    bg-warm-50 dark:bg-charcoal-700
    border transition-all duration-200
    text-warm-900 dark:text-warm-50
    placeholder:text-warm-400 dark:placeholder:text-warm-500
    focus:outline-none focus:ring-2 focus:ring-sage-400/40 dark:focus:ring-sage-500/30 focus:border-sage-400 dark:focus:border-sage-500
    ${error
      ? "border-red-400 dark:border-red-500/60"
      : "border-warm-200 dark:border-charcoal-500 hover:border-warm-300 dark:hover:border-charcoal-400"
    }
  `;

  return (
    <div className="space-y-1.5">
      {/* Label + tooltip */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.name}
          className="block text-sm font-medium text-warm-700 dark:text-warm-200"
        >
          {field.label}
        </label>
        <span
          title={field.tooltip}
          className="cursor-help text-warm-400 dark:text-warm-500 hover:text-warm-600 dark:hover:text-warm-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Input or Select */}
      {field.type === "select" && field.options ? (
        <select
          id={field.name}
          value={value}
          onChange={(e) => onChange(field.name, Number(e.target.value))}
          className={`${baseInputClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
        >
          <option value="" disabled>Select…</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.name}
          type="number"
          value={value}
          onChange={(e) => onChange(field.name, Number(e.target.value))}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.min !== undefined ? `${field.min} – ${field.max}` : ""}
          className={baseInputClasses}
        />
      )}

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
