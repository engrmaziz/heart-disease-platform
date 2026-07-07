import type { FieldMeta, HeartDiseaseInput } from "@/lib/types";

interface FormFieldProps {
  field: FieldMeta;
  value: number | string;
  onChange: (name: keyof HeartDiseaseInput, value: number) => void;
  error?: string;
}

export default function FormField({ field, value, onChange, error }: FormFieldProps) {
  const baseInputClasses = `
    w-full bg-transparent px-0 py-2.5 text-sm font-medium
    border-0 border-b border-zinc-200 dark:border-zinc-800
    text-zinc-950 dark:text-zinc-50
    placeholder:text-zinc-300 dark:placeholder:text-zinc-700
    focus:ring-0 focus:border-zinc-950 dark:focus:border-zinc-50
    transition-colors duration-200 rounded-none
    ${error ? "border-red-500 dark:border-red-500" : ""}
  `;

  return (
    <div className="relative group pt-1">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={field.name}
          className="block text-[10px] font-semibold tracking-widest uppercase text-zinc-500 dark:text-zinc-400"
        >
          {field.label}
        </label>
        <span
          title={field.tooltip}
          className="cursor-help text-zinc-300 dark:text-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {field.type === "select" && field.options ? (
        <select
          id={field.name}
          value={value}
          onChange={(e) => onChange(field.name, Number(e.target.value))}
          className={`${baseInputClasses} cursor-pointer appearance-none pr-6`}
          style={{ backgroundImage: "none" }} // Remove default arrows for ultra-minimal look
        >
          <option value="" disabled className="text-zinc-400">Select…</option>
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
          placeholder={field.min !== undefined ? `${field.min} - ${field.max}` : ""}
          className={baseInputClasses}
        />
      )}

      {/* Subtle chevron for select to replace background image */}
      {field.type === "select" && (
        <div className="absolute right-0 bottom-3 pointer-events-none text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}

      {error && (
        <p className="text-[10px] font-medium tracking-wide uppercase text-red-500 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
