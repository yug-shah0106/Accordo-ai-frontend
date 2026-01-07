/**
 * Theme Context - Global Dark Mode State Management
 *
 * Provides theme state and toggle functionality for the entire application.
 * Persists theme preference to localStorage and syncs with document class.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage immediately (synchronous)
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('accordo-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme class on mount and when theme changes
  useEffect(() => {
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark');
    // Add current theme class
    document.documentElement.classList.add(theme);
    // Save to localStorage
    localStorage.setItem('accordo-theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setLightTheme = (): void => {
    if (theme === 'light') return;
    toggleTheme();
  };

  const setDarkTheme = (): void => {
    if (theme === 'dark') return;
    toggleTheme();
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Custom hook to use theme context
 *
 * @example
 * const { theme, toggleTheme, isDark } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
