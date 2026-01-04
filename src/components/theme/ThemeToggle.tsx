/**
 * Theme Toggle Component
 *
 * Displays sun/moon icon button to toggle between light and dark themes.
 * Can be rendered as icon-only or with menu item styling.
 */

import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'menu') {
    // Menu item variant for sidebar
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className}`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <>
            <FiSun className="w-5 h-5 text-yellow-500" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <FiMoon className="w-5 h-5 text-blue-600" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  // Icon-only variant
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
}
