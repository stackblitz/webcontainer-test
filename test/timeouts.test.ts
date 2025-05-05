import { WebContainer as WebContainerApi } from "@webcontainer/api";
import { expect, test, vi } from "vitest";

import { WebContainer } from "../src/fixtures/webcontainer";

test("throws when WebContainer boot timeouts", async () => {
  vi.spyOn(WebContainerApi, "boot").mockReturnValue(new Promise(() => null));
  vi.useFakeTimers();

  const webcontainer = new WebContainer();
  vi.advanceTimersByTime(30_000);

  await expect(webcontainer.wait()).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: WebContainer boot timed out in 30s]`,
  );
});
