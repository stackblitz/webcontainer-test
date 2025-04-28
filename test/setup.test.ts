import { beforeEach, expect } from "vitest";
import { test, type TestContext } from "../src";

const counts = { setup: 0, beforeEach: 0 };

beforeEach<TestContext>(async ({ setup, webcontainer }) => {
  await setup(async () => {
    await webcontainer.writeFile("./example", "Hello world");
    counts.setup++;
  });

  counts.beforeEach++;
});

test.for([1, 2, 3])("state is restored %d", async (count, { webcontainer }) => {
  await expect(webcontainer.readFile("example")).resolves.toBe("Hello world");

  // setup should always be called just once as it's cached
  expect(counts.setup).toBe(1);

  // hook itself is called each time
  expect(counts.beforeEach).toBe(count);
});
