"use client";

import { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /**
   * `md` (default) is a fixed width that fits confirmations and short forms.
   * `lg` shrinks to its content's natural width on large screens (e.g. a
   * table, which should never be wider than it needs to be) instead of
   * stretching to a fixed size, capped so it never overflows the viewport.
   */
  size?: "md" | "lg";
  /** `dark` (default) is the brand navy surface used by confirmations and forms. `light` matches content designed for a white surface, like a data table. */
  tone?: "dark" | "light";
}

const sizeClasses: Record<"md" | "lg", string> = {
  md: "max-w-md",
  lg: "lg:w-fit lg:max-w-[min(92vw,72rem)]",
};

const toneClasses: Record<
  "dark" | "light",
  { dialog: string; title: string; closeButton: string }
> = {
  dark: {
    dialog: "bg-[#07131b]",
    title: "text-white",
    closeButton: "text-[#9cb5c4] hover:bg-white/10 hover:text-white",
  },
  light: {
    dialog: "border border-[#e5e5e5] bg-white",
    title: "text-[#101828]",
    closeButton: "text-[#6a7282] hover:bg-[#f3f4f6] hover:text-[#101828]",
  },
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Open Modal instances, in open order — lets nested modals (e.g. a detail
 * modal opened from within a list modal) figure out which one is topmost,
 * so Escape/Tab only affect that one instead of every open Modal at once
 * (each instance listens on `document`, so without this a single Escape
 * would close all of them simultaneously).
 */
const openModalStack: symbol[] = [];

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  tone = "dark",
}: ModalProps) {
  const toneClass = toneClasses[tone];
  const dialogRef = useRef<HTMLDivElement>(null);
  const [token] = useState(() => Symbol("modal"));
  // Kept in a ref (not the effect's dep array) so a parent re-render that
  // recreates `onClose` (a fresh arrow function every render, in every
  // caller) doesn't retrigger the effect below and yank focus mid-interaction.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    openModalStack.push(token);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? dialog)?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (openModalStack[openModalStack.length - 1] !== token) return;

      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const index = openModalStack.indexOf(token);
      if (index !== -1) openModalStack.splice(index, 1);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[85vh] w-full ${sizeClasses[size]} flex-col rounded-xl ${toneClass.dialog} p-6 shadow-[0_0_12px_#09c6b840] outline-none sm:p-8`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4">
          <h2 className={`text-lg font-bold ${toneClass.title}`}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className={`rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/50 focus-visible:outline-none ${toneClass.closeButton}`}
          >
            ✕
          </button>
        </div>

        <div className="mt-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
