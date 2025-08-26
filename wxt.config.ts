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
  webExt: {
    startUrls: ["https://wxt.dev"],
  },

  manifest: {
    icons: {
      "16": "icon-16.png",
      "32": "icon-32.png",
      "48": "icon-48.png",
      "96": "icon-96.png",
      "128": "icon-128.png",
    },
    action: {
      default_icon: {
        "16": "icon-16.png",
        "32": "icon-32.png",
        "48": "icon-48.png",
        "96": "icon-96.png",
        "128": "icon-128.png",
      },
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content/index.ts"],
      },
    ],
    permissions: ["tabs", "storage"],
  },
});
