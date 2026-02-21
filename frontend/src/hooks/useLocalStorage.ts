import { useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  function set(val: T) {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  }

  return [value, set];
}
