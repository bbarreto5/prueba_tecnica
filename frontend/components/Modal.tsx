"use client";

import { useEffect, useRef } from "react";

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

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  tone = "dark",
}: ModalProps) {
  const toneClass = toneClasses[tone];
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Kept in a ref (not the effect's dep array) so a parent re-render that
  // recreates `onClose` (a fresh arrow function every render, in every
  // caller) doesn't retrigger the effect below and yank focus mid-interaction.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Guarded (rather than unconditional) because React StrictMode runs this
    // effect twice in development without the DOM re-mounting in between.
    if (!dialog.open) dialog.showModal();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleCancel() {
      onCloseRef.current();
    }
    // Bound imperatively (rather than a JSX `onClick`) since a click
    // anywhere on the dialog's own box — including its ::backdrop, which is
    // outside the panel's rendered rect — targets the non-interactive
    // <dialog> element itself; only clicks outside that rect should close it.
    function handleClick(event: MouseEvent) {
      const rect = dialog!.getBoundingClientRect();
      const insidePanel =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!insidePanel) onCloseRef.current();
    }
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
      document.body.style.overflow = originalOverflow;
      // Closing (rather than leaving it open for React to unmount) lets the
      // browser restore focus to whatever triggered the modal, per the
      // native <dialog> close behavior.
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className={`fixed inset-x-4 inset-y-0 m-auto max-h-[85vh] w-full ${sizeClasses[size]} flex-col rounded-xl ${toneClass.dialog} p-6 shadow-[0_0_12px_#09c6b840] outline-none backdrop:bg-black/60 open:flex sm:p-8`}
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
    </dialog>
  );
}
