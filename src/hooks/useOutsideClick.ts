"use client";

import { useEffect, type RefObject } from "react";

export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  extraRef?: RefObject<HTMLElement>
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        (!extraRef?.current || !extraRef.current.contains(e.target as Node))
      ) {
        handler();
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler, extraRef]);
}
