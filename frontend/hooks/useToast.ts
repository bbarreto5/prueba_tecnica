"use client";

import { useCallback, useRef, useState } from "react";

const TOAST_DURATION_MS = 4000;

/** Shows a message for `TOAST_DURATION_MS`; a new call replaces whatever toast is currently showing. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(next);
    timeoutRef.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
  }, []);

  return { message, showToast };
}
