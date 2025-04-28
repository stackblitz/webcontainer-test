import { test as base } from "vitest";

import { Preview } from "./preview";
import { WebContainer } from "./webcontainer";

export interface TestContext {
  preview: Preview;
  webcontainer: WebContainer;
  setup: (callback: () => Promise<void>) => Promise<void>;

  /** @internal */
  _internalState: { current: Uint8Array | undefined };
}

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
 *   const { exit } = webcontainer.runCommand("npm", ["run", "dev"]);
 *
 *   await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
 *   await exit();
 * });
 * ```
 */
export const test = base.extend<Omit<TestContext, "_internalState">>({
  // @ts-ignore -- intentionally untyped, excluded from public API
  _internalState: { current: undefined },

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

  // @ts-ignore -- intentionally untyped, excluded from public API
  setup: async ({ webcontainer, _internalState }, use) => {
    const internalState = _internalState as TestContext["_internalState"];

    await use(async (callback) => {
      if (internalState.current) {
        await webcontainer.restore(internalState.current);
        return;
      }

      await callback();

      // save current state in fixture
      internalState.current = await webcontainer.export();
    });
  },
});
