import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import process from "node:process";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "./src") },
   },
   server: {
      // pozwala uruchomić drugą instancję na porcie przydzielonym z zewnątrz
      port: Number(process.env.PORT) || 5173,
   },
});
