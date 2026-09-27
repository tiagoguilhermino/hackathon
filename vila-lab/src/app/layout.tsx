import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vila de Personas · Laboratório",
  description:
    "Protótipo de hackathon (Hackathon Itaú 2026, Case C): personas de IA testam telas de um banco fictício. Dados sintéticos, resultados simulados.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
