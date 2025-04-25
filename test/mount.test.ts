import { expect } from "vitest";
import { test } from "../src";

test("user can mount directories from file-system to webcontainer", async ({
  webcontainer,
}) => {
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

  const pngFile = await webcontainer.runCommand("xxd", ["image.png"]);
  expect(pngFile).toMatchInlineSnapshot(`
    "00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR
    00000010: 0000 0001 0000 0001 0103 0000 0025 db56  .............%.V
    00000020: ca00 0000 0173 5247 4201 d9c9 2c7f 0000  .....sRGB...,...
    00000030: 0009 7048 5973 0000 0b13 0000 0b13 0100  ..pHYs..........
    00000040: 9a9c 1800 0000 0350 4c54 45ff ffff a7c4  .......PLTE.....
    00000050: 1bc8 0000 000a 4944 4154 789c 6364 0000  ......IDATx.cd..
    00000060: 0004 0002 2164 ad6a 0000 0000 4945 4e44  ....!d.j....IEND
    00000070: ae42 6082                                .B\`."
  `);
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
