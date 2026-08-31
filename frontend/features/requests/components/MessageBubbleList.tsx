import type { Message } from "../types";

interface MessageBubbleListProps {
  messages: Message[];
  currentUserId: string;
  requesterId: string;
  assigneeId: string | null;
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
        return (
          <li key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-[1.25rem] border px-4 py-3 sm:max-w-[70%] ${
                isOwn
                  ? "border-transparent bg-[#07131b] text-white"
                  : "border-[#e5e5e5] bg-white text-[#101828]"
              }`}
            >
              <p className={`text-xs font-semibold ${isOwn ? "text-[#9cb5c4]" : "text-[#6a7282]"}`}>
                {authorLabel(message.authorId)}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{message.content}</p>
              <p className={`mt-1.5 text-xs ${isOwn ? "text-[#6a7282]" : "text-[#9ca3af]"}`}>
                {message.createdAt}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
