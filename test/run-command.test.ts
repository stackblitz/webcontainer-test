import { expect } from "vitest";

import { test } from "../src";

test(
  "user can run commands inside webcontainer",
  { retry: 3 },
  async ({ webcontainer }) => {
    const output = await webcontainer.runCommand("node", ["--version"]);

    expect(output).toContain("v20");
  },
);

test("user can run interactive commands inside webcontainer", async ({
  webcontainer,
}) => {
  const { exit, waitForText, write } = webcontainer.runCommand("node");
  await waitForText("Welcome to Node.js v20");

  await write("console.log(20 + 19)\n");
  await waitForText("39");

  await write("console.log(os.platform(), os.arch())\n");
  await waitForText("linux x64");

  await exit();
});

test("user can see timeout errors with clear description", async ({
  webcontainer,
}) => {
  const { exit, waitForText, isDone } = webcontainer.runCommand("ls", ["/"]);

  await isDone;

  await expect(waitForText("This won't match anything", 10)).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Error: Timeout when waiting for text "This won't match anything".
    Received:
    bin  dev  etc  home tmp  usr]
  `);

  await exit();
});

test("user can listen for stream's chunks", async ({ webcontainer }) => {
  const { isDone, onData } = webcontainer.runCommand("node", [
    "--eval",
    "console.log('First'); setTimeout(() => console.log('Second'), 1_000);",
  ]);

  const data: string[] = [];
  onData((chunk) => data.push(chunk.trim()));

  await isDone;

  expect(data).toMatchInlineSnapshot(`
    [
      "First",
      "Second",
    ]
  `);
});
