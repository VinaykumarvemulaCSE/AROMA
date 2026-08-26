"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { haptic } from "@/lib/haptics";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    haptic("light");
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      className={`size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors ${className}`}
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4 text-gold animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="size-4 text-coffee animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
}
