import Link from "next/link";

export default function RequestNotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-6 font-sans">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="text-base font-bold text-[#101828]">Solicitud no encontrada</p>
        <p className="text-sm text-[#6a7282]">
          La solicitud que buscas no existe o fue eliminada.
        </p>
        <Link
          href="/requests"
          className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Volver a solicitudes
        </Link>
      </div>
    </div>
  );
}
