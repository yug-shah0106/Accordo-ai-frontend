import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  interval?: number; // milliseconds - debounce delay after data change
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  hasDraft: boolean;
  clearSaved: () => void;
  loadSaved: () => any | null;
}

/**
 * Hook to automatically save form data to localStorage
 * @param key - Unique key for localStorage
 * @param data - Data to save
 * @param interval - Debounce delay in milliseconds after data change (default: 2000 = 2 seconds)
 * @param enabled - Whether auto-save is enabled (default: true)
 */
export const useAutoSave = ({
  key,
  data,
  interval = 2000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');
  const isInitialMount = useRef(true);

  // Check for existing draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(key);
    setHasDraft(!!saved);

    // Load timestamp if exists
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    if (timestamp) {
      setLastSaved(new Date(timestamp));
    }
  }, [key]);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!enabled) return;

    try {
      const dataString = JSON.stringify(data);

      // Only save if data has changed
      if (dataString === previousDataRef.current) {
        return;
      }

      setIsSaving(true);
      localStorage.setItem(key, dataString);
      localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
      previousDataRef.current = dataString;
      setLastSaved(new Date());
      setHasDraft(true);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setIsSaving(false);
    }
  }, [data, enabled, key]);

  // Load from localStorage
  const loadSaved = (): any | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const timestamp = localStorage.getItem(`${key}_timestamp`);
        if (timestamp) {
          setLastSaved(new Date(timestamp));
        }
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  };

  // Clear saved data
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      setLastSaved(null);
      setHasDraft(false);
      previousDataRef.current = '';
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [key]);

  // Auto-save effect - debounced on data change
  useEffect(() => {
    if (!enabled) return;

    // Skip initial mount to avoid saving empty/default data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousDataRef.current = JSON.stringify(data);
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, interval);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, interval, saveToLocalStorage]);

  // Save on unmount if there are changes
  useEffect(() => {
    return () => {
      if (enabled && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Only save if data has changed from previous
        const currentDataString = JSON.stringify(data);
        if (currentDataString !== previousDataRef.current) {
          try {
            localStorage.setItem(key, currentDataString);
            localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
          } catch (error) {
            console.error('Error saving on unmount:', error);
          }
        }
      }
    };
  }, [enabled, data, key]);

  return {
    lastSaved,
    isSaving,
    hasDraft,
    clearSaved,
    loadSaved,
  };
};
