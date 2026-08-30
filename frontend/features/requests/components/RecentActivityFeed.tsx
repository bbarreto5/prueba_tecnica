import type { ActivityEvent } from "../types";

export function RecentActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-[#6a7282]">No hay actividad reciente.</p>;
  }

  return (
    <ol className="flex flex-col gap-5">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ff8b1a]"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm text-[#101828]">{event.description}</p>
            <p className="mt-0.5 text-xs text-[#6a7282]">{event.timestamp}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
