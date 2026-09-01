interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[2rem] border border-[#e5e5e5] bg-white px-5 py-3 text-sm font-medium text-[#101828] shadow-[0_0_20px_#09c6b866]"
    >
      {message}
    </div>
  );
}
