import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import type { WxtViteConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () =>
    ({
      plugins: [tailwindcss()],
    } as WxtViteConfig),
  modules: ["@wxt-dev/module-react"],
  runner: {
    startUrls: ["https://wxt.dev"],
  },

  manifest: {
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content/index.ts"],
      },
    ],
    permissions: ["tabs", "storage"],
  },
});
