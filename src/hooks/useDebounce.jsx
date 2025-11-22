import { useRef } from "react";

const useDebounce = (callback, delay) => {
  const debounceTimer = useRef(null);

  const debounce = (value) => {
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
