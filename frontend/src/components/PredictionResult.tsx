import type { PredictionResult } from "@/lib/types";

interface Props {
  result: PredictionResult | null;
  loading: boolean;
}

export default function PredictionResultCard({ result, loading }: Props) {
  if (!result && !loading) {
    return (
      <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 flex flex-col justify-center items-center h-full min-h-[400px]">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-600 text-center max-w-[200px]">
          Awaiting Data Input
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-zinc-200 dark:border-zinc-800 p-8 h-full min-h-[400px] flex flex-col justify-center items-center">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  const isDisease = result!.prediction === 1;
  const confidence = Math.round(result!.confidence * 100);
  const riskLevel = result!.risk_level;

  // Ultra-sophisticated coloring
  const statusColor = isDisease 
    ? "text-amber-700 dark:text-amber-500" 
    : "text-emerald-700 dark:text-emerald-500";

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden animate-fadeIn h-full flex flex-col">
      <div className="p-8 lg:p-10 flex-1 space-y-12">
        {/* Header */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            Diagnosis Output
          </p>
          <h3 className={`text-4xl font-bold tracking-tight ${statusColor}`}>
            {riskLevel}
          </h3>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {isDisease ? "Elevated cardiovascular risk detected." : "No significant indications of heart disease."}
          </p>
        </div>

        {/* Confidence Meter */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              Confidence Index
            </p>
            <span className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white tabular-nums">
              {confidence}%
            </span>
          </div>
          {/* Minimalist 2px progress bar */}
          <div className="w-full h-[2px] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-in-out ${isDisease ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* LLM Clinical Insight */}
        {result!.clinical_insight && (
          <div className="space-y-4 pt-6">
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              Clinical Insight
            </p>
            <blockquote className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-5 py-1">
              <p className="font-serif text-lg leading-relaxed text-zinc-800 dark:text-zinc-300 italic">
                "{result!.clinical_insight}"
              </p>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}
