import { defineConfig } from "vitest/config";
import { vitestWebcontainers } from "./src/plugin";

export default defineConfig({
  plugins: [vitestWebcontainers()],

  test: {
    browser: {
      headless: true,
    },

    workspace: [
      {
        extends: true,
        test: {
          name: "Playwright",
          browser: {
            enabled: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }, { browser: "firefox" }],
            headless: true,
          },
        },
      },

      {
        extends: true,
        test: {
          name: "WebdriverIO",
          browser: {
            enabled: true,
            provider: "webdriverio",
            instances: [{ browser: "firefox" }, { browser: "chrome" }],
            headless: true,
          },
        },
      },
    ],
  },
});
