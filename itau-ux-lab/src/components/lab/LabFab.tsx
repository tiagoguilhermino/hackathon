import Link from "next/link";
import { FlaskConical } from "lucide-react";

/** FAB discreto (quase invisível até o hover) que abre o Modo Laboratório. */
export function LabFab() {
  return (
    <Link
      href="/lab"
      aria-label="Abrir Modo Laboratório"
      title="Modo Laboratório"
      className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-itau-navy text-white opacity-15 shadow-lg transition-opacity hover:opacity-100 focus:opacity-100"
    >
      <FlaskConical size={20} />
    </Link>
  );
}
