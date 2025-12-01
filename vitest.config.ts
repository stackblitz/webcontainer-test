import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { vitestWebContainers } from "./src/plugin";

export default defineConfig({
  plugins: [vitestWebContainers()],

  test: {
    reporters: "verbose",

    // browser instances are running parallel, so they take 200% of the CPU count. Lower the amount to reduce resource usage
    maxWorkers: "50%",

    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: "chromium", name: "Chromium" },
        { browser: "firefox", name: "Firefox" },
      ],
      headless: true,
    },
  },
});
