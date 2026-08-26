"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aroma-theme") as Theme | null;
      if (saved && ["light", "dark", "system"].includes(saved)) {
        setThemeState(saved);
      }
    } catch {
      // localStorage error fallback
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let actual: "light" | "dark" = "light";

    if (theme === "system") {
      actual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      actual = theme;
    }

    setResolvedTheme(actual);

    if (actual === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("aroma-theme", t);
    } catch {
      // storage quota error fallback
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
