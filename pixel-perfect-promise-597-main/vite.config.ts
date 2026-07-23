import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Configuração "pura" do Vite + TanStack Start, sem o pacote
// @lovable.dev/vite-tanstack-config (removido junto com a integração com o Lovable).
//
// - tsConfigPaths: resolve o alias "@/..." definido em tsconfig.json
// - tailwindcss: plugin oficial do Tailwind v4
// - tanstackStart: SSR + roteamento de arquivos do TanStack Start
//     target "node-server" gera uma saída Node.js padrão (.output/server),
//     que roda com `node .output/server/index.mjs` ou em qualquer host Node
//     (Railway, Render, VPS, etc). Para Vercel/Netlify, troque para o preset
//     correspondente (ver README).
// - viteReact: precisa vir depois do tanstackStart()
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      target: "node-server",
    }),
    viteReact(),
  ],
});
