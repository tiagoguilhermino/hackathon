import { FlaskConical, LayoutDashboard, Smartphone } from "lucide-react";
import Link from "next/link";

const ITENS = [
  { href: "/", rotulo: "App do banco", Icone: Smartphone },
  { href: "/lab", rotulo: "Laboratório", Icone: FlaskConical },
  { href: "/dashboard", rotulo: "Dashboard", Icone: LayoutDashboard },
] as const;

export function Navegacao({ atual }: { atual: "/" | "/lab" | "/dashboard" }) {
  return (
    <nav aria-label="Seções" className="border-b border-borda bg-cartao">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="text-sm font-bold text-azul">Vila de Personas · Lab</span>
        <ul className="flex flex-wrap gap-1">
          {ITENS.map(({ href, rotulo, Icone }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={atual === href ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  atual === href ? "bg-azul text-white" : "text-azul hover:bg-azul-claro"
                }`}
              >
                <Icone aria-hidden size={16} /> {rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
