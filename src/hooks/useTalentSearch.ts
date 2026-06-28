"use client";

import { useCallback, useState } from "react";
import { searchTalents, type Talent } from "@/lib/talents";

export function useTalentSearch(pool?: Talent[]) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInput = useCallback(
    (val: string, exclude: string[] = []) => {
      setInput(val);
      if (val.trim().length > 0) {
        const results = searchTalents(val, pool).filter(
          (t) => !exclude.includes(t.name)
        );
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    },
    [pool]
  );

  const clear = useCallback(() => {
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
  }, []);

  const onFocus = useCallback(() => {
    if (input && suggestions.length > 0) setShowDropdown(true);
  }, [input, suggestions]);

  return { input, suggestions, showDropdown, handleInput, clear, onFocus, setInput, setShowDropdown };
}
