import { test as base } from "vitest";

import { Preview } from "./preview";
import { WebContainer } from "./webcontainer";

/**
 * Pre-defined [`test()` function](https://vitest.dev/guide/test-context.html#extend-test-context) with WebContainer fixtures.
 *
 * @example
 * ```ts
 * import { test } from "@webcontainer/test";
 *
 * test("run development server inside webcontainer", async ({
 *   webcontainer,
 *   preview,
 * }) => {
 *   await webcontainer.mount("path/to/project");
 *
 *   await webcontainer.runCommand("npm", ["install"]);
 *   webcontainer.runCommand("npm", ["run", "dev"]);
 *
 *   await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
 * });
 * ```
 */
export const test = base.extend<{
  preview: Preview;
  webcontainer: WebContainer;
}>({
  preview: async ({ webcontainer }, use) => {
    await webcontainer.wait();

    const preview = new Preview();
    webcontainer.onServerReady((options) => preview.setup(options.url));

    await use(preview);

    await preview.teardown();
  },

  webcontainer: async ({}, use) => {
    const webcontainer = new WebContainer();
    await webcontainer.wait();

    await use(webcontainer);

    addEventListener("unhandledrejection", (event) => {
      if (
        event.reason instanceof Error &&
        event.reason.message === "Process aborted"
      ) {
        return event.preventDefault();
      }

      return Promise.reject(event.reason);
    });

    await webcontainer.teardown();
  },
});
