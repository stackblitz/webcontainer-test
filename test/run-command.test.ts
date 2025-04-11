import { expect } from "vitest";

import { test } from "../src";

test("user can run commands inside webcontainer", async ({ webcontainer }) => {
  const output = await webcontainer.runCommand("node", ["--version"]);

  expect(output).toMatchInlineSnapshot(`"v20.19.0"`);
});
