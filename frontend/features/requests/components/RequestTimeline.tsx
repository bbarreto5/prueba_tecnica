import type { TimelineEvent } from "../types";

export function RequestTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-[#6a7282]">No hay actividad registrada.</p>;
  }

  return (
    <ol className="flex flex-col">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < events.length - 1 ? (
            <span
              className="absolute top-3 left-[4.5px] h-full w-px bg-[#e5e5e5]"
              aria-hidden="true"
            />
          ) : null}
          <span
            className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff8b1a]"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#6a7282] uppercase">
              {event.type}
            </p>
            <p className="mt-0.5 text-sm text-[#101828]">{event.description}</p>
            <p className="mt-0.5 text-xs text-[#6a7282]">
              {event.actor} · {event.timestamp}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
