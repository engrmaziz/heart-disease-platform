import Header from "@/components/Header";
import PatientForm from "@/components/PatientForm";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Minimalist Hero section */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Patient Risk Assessment
              </h2>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Enter clinical measurements below to evaluate cardiovascular risk. All diagnostic features are rigidly validated against accepted thresholds before analytical processing.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <PatientForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
            CardioRisk v1.0 — For research purposes
          </p>
          <p className="text-[11px] font-medium tracking-wider uppercase text-zinc-400 dark:text-zinc-500 hidden sm:block">
            Model: RandomForest · UCI Dataset
          </p>
        </div>
      </footer>
    </>
  );
}
