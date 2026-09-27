import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O repositório tem outros projetos (vila-de-personas, Frontend, vila-lab): a raiz deste app
  // é esta pasta. Sem isso, um package-lock.json perdido na raiz do repositório faz o Turbopack
  // tomar o repositório inteiro como raiz (aviso "multiple lockfiles" e mais arquivos vigiados).
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
