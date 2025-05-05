import { defineConfig } from "vitest/config";
import { vitestWebcontainers } from "./src/plugin";

export default defineConfig({
  plugins: [vitestWebcontainers()],

  test: {
    reporters: "verbose",

    browser: {
      enabled: true,
      provider: "playwright",
      instances: [
        { browser: "chromium", name: "Chromium" },
        { browser: "firefox", name: "Firefox" },
      ],
      headless: true,
      isolate: false,
    },
  },
});
