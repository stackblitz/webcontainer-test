import type { Vite } from "vitest/node";
import { readDirectory } from "./commands";

const COEP = "Cross-Origin-Embedder-Policy";
const COOP = "Cross-Origin-Opener-Policy";

/**
 * Vitest [plugin](https://vitest.dev/advanced/api/plugin.html#plugin-api) for configuring
 * WebContainer related options.
 */
export function vitestWebContainers(): Vite.Plugin {
  return {
    name: "vitest:webcontainers",
    config(config, env) {
      if (env.mode !== "test") {
        return;
      }

      config.test ||= {};
      config.test.browser ||= {};
      config.test.browser.commands ||= {};
      config.test.browser.commands.readDirectory = readDirectory;

      config.server ||= {};
      config.server.headers ||= {};

      const headers = config.server.headers;

      if (headers[COEP] && headers[COEP] !== "require-corp") {
        console.warn(
          `[vitest:webcontainers] Overriding ${COEP} header during test run`,
        );
      }

      if (headers[COOP] && headers[COOP] !== "same-origin") {
        console.warn(
          `[vitest:webcontainers] Overriding ${COOP} header during test run`,
        );
      }

      headers[COEP] = "require-corp";
      headers[COOP] = "same-origin";
    },
  };
}
