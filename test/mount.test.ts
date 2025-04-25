import { expect } from "vitest";
import { test } from "../src";

test(
  "user can mount directories from file-system to webcontainer",
  { retry: 3 },
  async ({ webcontainer }) => {
    await webcontainer.mount("test/fixtures/mount-example");

    const ls = await webcontainer.runCommand("ls");
    expect(ls).toMatchInlineSnapshot(`"file-1.ts image.png nested"`);

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

    // TODO: Once WebcontainerProcess output resolving is visible, assert whole png content
    const pngFile = await webcontainer.runCommand("xxd", ["image.png"]);
    expect(pngFile).toContain(
      "00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR",
    );
  },
);

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
