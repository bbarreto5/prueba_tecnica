import { Button } from "@/components/Button";
import type { RequestMessage } from "../types";

export function RequestMessages({ messages }: { messages: RequestMessage[] }) {
  return (
    <div className="flex flex-col gap-6">
      {messages.length === 0 ? (
        <p className="text-sm text-[#6a7282]">Todavía no hay mensajes en esta solicitud.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {messages.map((message) => {
            const isSupport = message.role === "support";
            return (
              <li
                key={message.id}
                className={`flex ${isSupport ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.25rem] border px-4 py-3 sm:max-w-[70%] ${
                    isSupport
                      ? "border-transparent bg-[#07131b] text-white"
                      : "border-[#e5e5e5] bg-white text-[#101828]"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${isSupport ? "text-[#9cb5c4]" : "text-[#6a7282]"}`}
                  >
                    {message.author}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`mt-1.5 text-xs ${isSupport ? "text-[#6a7282]" : "text-[#9ca3af]"}`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-col gap-2 border-t border-[#e5e5e5] pt-6">
        <label htmlFor="reply" className="text-xs font-medium text-[#6a7282]">
          Responder
        </label>
        <textarea
          id="reply"
          name="reply"
          rows={3}
          placeholder="Escribe una respuesta..."
          className="rounded-[1.25rem] border border-[#cccccc] bg-white px-4 py-3 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
        />
        <div className="flex justify-end">
          <Button variant="primary">Enviar</Button>
        </div>
      </div>
    </div>
  );
}
