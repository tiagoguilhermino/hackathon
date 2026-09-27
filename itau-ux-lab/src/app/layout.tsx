import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrototypeNotice } from "@/components/common/PrototypeNotice";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vila de Personas · Laboratório",
  description: "Protótipo de hackathon: agentes de IA com perfis sintéticos testam telas de um banco fictício (Lume) antes do teste com pessoas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PrototypeNotice />
        {children}
      </body>
    </html>
  );
}
