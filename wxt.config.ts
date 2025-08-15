import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
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
    permissions: ["tabs"],
  },
});
