import { test as base } from "vitest";

import { Preview } from "./preview";
import { WebContainer } from "./webcontainer";

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

    await webcontainer.teardown();
  },
});
