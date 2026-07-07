import Header from "@/components/Header";
import PatientForm from "@/components/PatientForm";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <div className="border-b border-warm-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-warm-900 dark:text-warm-50 tracking-tight">
                Patient Risk Assessment
              </h2>
              <p className="mt-2 text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
                Enter clinical measurements below to evaluate the patient&apos;s heart disease risk. 
                All 13 diagnostic features are validated against clinically accepted ranges before analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PatientForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-warm-200 dark:border-charcoal-600 bg-white/50 dark:bg-charcoal-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <p className="text-xs text-warm-400 dark:text-warm-500">
            CardioRisk v1.0 — For research and educational purposes only
          </p>
          <p className="text-xs text-warm-400 dark:text-warm-500">
            Model: RandomForest Pipeline · 13 Features · UCI Heart Disease Dataset
          </p>
        </div>
      </footer>
    </>
  );
}
