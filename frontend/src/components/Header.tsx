import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-full border-b border-warm-200 dark:border-charcoal-600 bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          {/* Heart + medical cross icon */}
          <div className="w-9 h-9 rounded-lg bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-700/50 flex items-center justify-center">
            <svg className="w-5 h-5 text-sage-600 dark:text-sage-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-warm-900 dark:text-warm-50 leading-tight tracking-tight">
              CardioRisk
            </h1>
            <p className="text-xs text-warm-500 dark:text-warm-400 leading-tight">
              Heart Disease Risk Assessment
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-sage-700 dark:text-sage-300">Model Online</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
