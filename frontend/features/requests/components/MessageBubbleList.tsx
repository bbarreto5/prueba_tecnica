import type { Message } from "../types";

interface MessageBubbleListProps {
  messages: Message[];
  currentUserId: string;
  requesterId: string;
  assigneeId: string | null;
}

const AVATAR_TONE: Record<string, string> = {
  Tú: "bg-[#ff8b1a] text-[#101828]",
  Soporte: "bg-[#09c6b8]/20 text-[#09c6b8]",
  Solicitante: "bg-[#9ca3af]/25 text-[#6a7282]",
  Equipo: "bg-[#9ca3af]/25 text-[#6a7282]",
};

function Avatar({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONE[label] ?? AVATAR_TONE.Equipo}`}
    >
      {label.charAt(0)}
    </span>
  );
}

/**
 * Read-only rendering of a conversation — shared by the live composer
 * (`RequestMessages`) and the client-history modal (`ClientRequestDetailModal`),
 * which never shows a reply form at all.
 */
export function MessageBubbleList({
  messages,
  currentUserId,
  requesterId,
  assigneeId,
}: MessageBubbleListProps) {
  function authorLabel(authorId: string): string {
    if (authorId === currentUserId) return "Tú";
    if (authorId === assigneeId) return "Soporte";
    if (authorId === requesterId) return "Solicitante";
    return "Equipo";
  }

  if (messages.length === 0) {
    return <p className="text-sm text-[#6a7282]">No hay mensajes todavía.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {messages.map((message) => {
        const isOwn = message.authorId === currentUserId;
        const label = authorLabel(message.authorId);
        return (
          <li
            key={message.id}
            className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            {!isOwn ? <Avatar label={label} /> : null}
            <div
              className={`max-w-[85%] rounded-[1.25rem] border px-4 py-3 sm:max-w-[70%] ${
                isOwn
                  ? "border-transparent bg-[#07131b] text-white"
                  : "border-[#e5e5e5] bg-white text-[#101828]"
              }`}
            >
              <p className={`text-xs font-semibold ${isOwn ? "text-[#9cb5c4]" : "text-[#6a7282]"}`}>
                {label}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{message.content}</p>
              <p className={`mt-1.5 text-xs ${isOwn ? "text-[#6a7282]" : "text-[#9ca3af]"}`}>
                {message.createdAt}
              </p>
            </div>
            {isOwn ? <Avatar label={label} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
