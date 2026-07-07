import ThemeToggle from "./ThemeToggle";
import { UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-black/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-white flex items-center justify-center">
            <svg className="w-4 h-4 text-white dark:text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            CardioRisk
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <button className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none" aria-label="User profile">
            <UserCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
