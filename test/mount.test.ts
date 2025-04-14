import { expect } from "vitest";
import { test } from "../src";

test("user can mount directories from file-system to webcontainer", async ({
  webcontainer,
}) => {
  await webcontainer.mount("test/fixtures/mount-example");

  const ls = await webcontainer.runCommand("ls");
  expect(ls).toMatchInlineSnapshot(`"file-1.ts nested"`);

  const lsNested = await webcontainer.runCommand("ls", ["nested"]);
  expect(lsNested).toMatchInlineSnapshot(`"file-2.ts"`);

  const catFile = await webcontainer.runCommand("cat", ["file-1.ts"]);
  expect(catFile).toMatchInlineSnapshot(`"export default "Hello world";"`);

  const catNestedFile = await webcontainer.runCommand("cat", [
    "nested/file-2.ts",
  ]);
  expect(catNestedFile).toMatchInlineSnapshot(
    `"export default "Hello from nested file";"`,
  );
});

test("user can mount inlined FileSystemTree to webcontainer", async ({
  webcontainer,
}) => {
  await webcontainer.mount({
    "file-1.ts": {
      file: { contents: 'export default "Hello world";' },
    },
    nested: {
      directory: {
        "file-2.ts": {
          file: { contents: 'export default "Hello from nested file";' },
        },
      },
    },
  });

  const ls = await webcontainer.runCommand("ls");
  expect(ls).toMatchInlineSnapshot(`"file-1.ts nested"`);

  const lsNested = await webcontainer.runCommand("ls", ["nested"]);
  expect(lsNested).toMatchInlineSnapshot(`"file-2.ts"`);

  const catFile = await webcontainer.runCommand("cat", ["file-1.ts"]);
  expect(catFile).toMatchInlineSnapshot(`"export default "Hello world";"`);

  const catNestedFile = await webcontainer.runCommand("cat", [
    "nested/file-2.ts",
  ]);
  expect(catNestedFile).toMatchInlineSnapshot(
    `"export default "Hello from nested file";"`,
  );
});

test("user should see error when attemping to mount files outside project root", async ({
  webcontainer,
}) => {
  await expect(() => webcontainer.mount("/home/non-existing")).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Error: [vitest:webcontainers] Cannot read files outside project root:
    {
      "directory": "/home/non-existing",
      "resolved": "/home/non-existing"
    }]
  `);

  await expect(() => webcontainer.mount("/../../non-existing")).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Error: [vitest:webcontainers] Cannot read files outside project root:
    {
      "directory": "/../../non-existing",
      "resolved": "/non-existing"
    }]
  `);
});
