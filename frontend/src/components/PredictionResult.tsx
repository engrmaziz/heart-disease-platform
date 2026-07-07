import type { PredictionResult } from "@/lib/types";

interface Props {
  result: PredictionResult | null;
  loading: boolean;
}

export default function PredictionResultCard({ result, loading }: Props) {
  // ── Empty / idle state ──
  if (!result && !loading) {
    return (
      <div className="bg-white dark:bg-charcoal-700 rounded-2xl border border-warm-200 dark:border-charcoal-600 shadow-sm dark:shadow-none p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warm-100 dark:bg-charcoal-600 flex items-center justify-center">
          <svg className="w-8 h-8 text-warm-400 dark:text-warm-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-200 mb-1">
          Assessment Results
        </h3>
        <p className="text-xs text-warm-500 dark:text-warm-400 leading-relaxed max-w-[200px] mx-auto">
          Fill in the patient data and run the assessment to see the risk prediction.
        </p>
      </div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="bg-white dark:bg-charcoal-700 rounded-2xl border border-warm-200 dark:border-charcoal-600 shadow-sm dark:shadow-none p-8">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-warm-100 dark:bg-charcoal-600" />
          <div className="w-32 h-4 rounded bg-warm-100 dark:bg-charcoal-600" />
          <div className="w-full h-3 rounded bg-warm-100 dark:bg-charcoal-600" />
          <div className="w-3/4 h-3 rounded bg-warm-100 dark:bg-charcoal-600" />
        </div>
      </div>
    );
  }

  // ── Result state ──
  const isDisease = result!.prediction === 1;
  const confidence = Math.round(result!.confidence * 100);
  const riskLevel = result!.risk_level;

  // Color mapping based on risk
  const riskColors = getRiskColors(riskLevel, isDisease);

  return (
    <div className={`
      bg-white dark:bg-charcoal-700 rounded-2xl border shadow-sm dark:shadow-none overflow-hidden
      animate-fadeIn
      ${riskColors.border}
    `}>
      {/* Risk badge header */}
      <div className={`px-6 py-4 ${riskColors.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${riskColors.iconBg}`}>
              {isDisease ? (
                <svg className={`w-5 h-5 ${riskColors.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${riskColors.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${riskColors.labelColor}`}>
                Prediction
              </p>
              <p className={`text-lg font-bold ${riskColors.titleColor}`}>
                {riskLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Classification */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wider">
            Classification
          </p>
          <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold
            ${riskColors.badgeBg} ${riskColors.badgeText}
          `}>
            <span className={`w-2 h-2 rounded-full ${riskColors.dot}`} />
            {isDisease ? "Heart Disease Detected" : "No Heart Disease"}
          </div>
        </div>

        {/* Confidence meter */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wider">
              Model Confidence
            </p>
            <span className={`text-xl font-bold tabular-nums ${riskColors.confidenceText}`}>
              {confidence}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-warm-100 dark:bg-charcoal-600 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${riskColors.progressBar}`}
              style={{ width: `${confidence}%` }}
            />
          </div>

          {/* Confidence breakdown */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-650 border border-warm-100 dark:border-charcoal-600">
              <p className="text-xs text-warm-500 dark:text-warm-400 mb-0.5">Disease Probability</p>
              <p className="text-sm font-bold text-warm-800 dark:text-warm-100 tabular-nums">
                {isDisease ? confidence : 100 - confidence}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-650 border border-warm-100 dark:border-charcoal-600">
              <p className="text-xs text-warm-500 dark:text-warm-400 mb-0.5">Healthy Probability</p>
              <p className="text-sm font-bold text-warm-800 dark:text-warm-100 tabular-nums">
                {isDisease ? 100 - confidence : confidence}%
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Insight */}
        {result!.clinical_insight && (
          <div className="pt-4 border-t border-warm-100 dark:border-charcoal-600">
            <p className="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wider mb-2">
              Clinical Insight
            </p>
            <p className="text-sm text-warm-700 dark:text-warm-200 leading-relaxed bg-warm-50 dark:bg-charcoal-750 p-3 rounded-xl border border-warm-100 dark:border-charcoal-600">
              {result!.clinical_insight}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="pt-4 border-t border-warm-100 dark:border-charcoal-600">
          <p className="text-[11px] text-warm-400 dark:text-warm-500 leading-relaxed">
            This assessment is generated by a machine learning model and should not replace professional medical advice. 
            Always consult a qualified healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Color utility ──────────────────────────────────────────────────────────

function getRiskColors(riskLevel: string, isDisease: boolean) {
  if (!isDisease) {
    return {
      border: "border-sage-200 dark:border-sage-700/40",
      headerBg: "bg-sage-50 dark:bg-sage-900/20",
      iconBg: "bg-sage-100 dark:bg-sage-800/40",
      iconColor: "text-sage-600 dark:text-sage-400",
      labelColor: "text-sage-600 dark:text-sage-400",
      titleColor: "text-sage-800 dark:text-sage-200",
      badgeBg: "bg-sage-50 dark:bg-sage-900/30",
      badgeText: "text-sage-700 dark:text-sage-300",
      dot: "bg-sage-500",
      confidenceText: "text-sage-700 dark:text-sage-300",
      progressBar: "bg-sage-500 dark:bg-sage-500",
    };
  }

  if (riskLevel.includes("High")) {
    return {
      border: "border-red-200 dark:border-red-800/40",
      headerBg: "bg-red-50 dark:bg-red-900/15",
      iconBg: "bg-red-100 dark:bg-red-800/30",
      iconColor: "text-red-600 dark:text-red-400",
      labelColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-800 dark:text-red-200",
      badgeBg: "bg-red-50 dark:bg-red-900/25",
      badgeText: "text-red-700 dark:text-red-300",
      dot: "bg-red-500",
      confidenceText: "text-red-700 dark:text-red-300",
      progressBar: "bg-red-500 dark:bg-red-500",
    };
  }

  // Moderate / Elevated
  return {
    border: "border-amber-200 dark:border-amber-800/40",
    headerBg: "bg-amber-50 dark:bg-amber-900/15",
    iconBg: "bg-amber-100 dark:bg-amber-800/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    labelColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-800 dark:text-amber-200",
    badgeBg: "bg-amber-50 dark:bg-amber-900/25",
    badgeText: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    confidenceText: "text-amber-700 dark:text-amber-300",
    progressBar: "bg-amber-500 dark:bg-amber-500",
  };
}
