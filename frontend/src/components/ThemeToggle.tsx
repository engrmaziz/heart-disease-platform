"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-zinc-400 hover:text-zinc-50 transition-colors" strokeWidth={2} />
      ) : (
        <Sun className="w-4 h-4 text-zinc-500 hover:text-zinc-950 transition-colors" strokeWidth={2} />
      )}
    </button>
  );
}
