import { expect } from "vitest";
import { test } from "../src";

test("user can create files and folders into webcontainer", async ({
  webcontainer,
}) => {
  await webcontainer.writeFile("/example", "Hello world");
  await webcontainer.mkdir("/folder");

  await expect(webcontainer.readdir("/")).resolves.toStrictEqual([
    "example",
    "folder",
  ]);
  await expect(webcontainer.readFile("/example")).resolves.toBe("Hello world");
});

test("user can rename files and folders in webcontainer", async ({
  webcontainer,
}) => {
  await webcontainer.writeFile("/example", "Hello world");
  await webcontainer.mkdir("/folder");

  await webcontainer.rename("/example", "/example-2");
  await webcontainer.rename("/folder", "/folder-2");

  await expect(webcontainer.readdir("/")).resolves.toStrictEqual([
    "example-2",
    "folder-2",
  ]);
});

test("user can remove files from webcontainer", async ({ webcontainer }) => {
  await webcontainer.writeFile("/first", "1");
  await webcontainer.writeFile("/second", "2");
  await webcontainer.writeFile("/third", "3");

  await webcontainer.rm("/second");
  await expect(webcontainer.readdir("/")).resolves.toStrictEqual([
    "first",
    "third",
  ]);
});
