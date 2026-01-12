import { useRef } from "react";

// ============================================================================
// Types
// ============================================================================

type DebounceCallback<T> = (value: T) => void;

// ============================================================================
// Hook
// ============================================================================

const useDebounce = <T = any,>(
  callback: DebounceCallback<T>,
  delay: number
): ((value: T) => void) => {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const debounce = (value: T): void => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      callback(value);
    }, delay);
  };

  return debounce;
};

export default useDebounce;
