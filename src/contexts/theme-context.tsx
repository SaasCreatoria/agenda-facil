
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "agenda-facil-theme" }: {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>(storageKey, defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const applyTheme = (themeToApply: Theme) => {
      let currentTheme: 'light' | 'dark';
      if (themeToApply === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = systemPrefersDark ? 'dark' : 'light';
      } else {
        currentTheme = themeToApply;
      }
      
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(currentTheme);
      setResolvedTheme(currentTheme);
    };

    applyTheme(storedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (storedTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storedTheme]);

  const setTheme = (theme: Theme) => {
    setStoredTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme: storedTheme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

