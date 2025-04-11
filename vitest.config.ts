import { defineConfig } from "vitest/config";
import { vitestWebcontainers } from "./src/plugin";

export default defineConfig({
  plugins: [vitestWebcontainers()],
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});
