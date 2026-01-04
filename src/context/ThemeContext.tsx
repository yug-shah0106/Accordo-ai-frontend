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
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('accordo-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    } else {
      // Default to light theme
      document.documentElement.classList.add('light');
      localStorage.setItem('accordo-theme', 'light');
    }
    setIsLoading(false);
  }, []);

  const toggleTheme = (): void => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';

    // Remove old theme class
    document.documentElement.classList.remove(theme);

    // Add new theme class
    document.documentElement.classList.add(newTheme);

    // Save to localStorage
    localStorage.setItem('accordo-theme', newTheme);

    // Update state
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

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

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
