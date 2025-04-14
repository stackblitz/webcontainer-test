import { readdir, readFile, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { FileSystemTree } from "@webcontainer/api";
import type { BrowserCommand } from "vitest/node";

// custom command to read directories from browser context. Used for mounting directories inside webcontainer
export const readDirectory: BrowserCommand<[directory: string]> = async (
  context,
  directory,
): Promise<FileSystemTree> => {
  const root = context.project.config.root;
  const resolved = resolve(root, directory);

  if (!resolved.startsWith(root)) {
    throw new Error(
      `[vitest:webcontainers] Cannot read files outside project root:\n${JSON.stringify(
        { directory, resolved },
        null,
        2,
      )}`,
    );
  }

  const files = await recursiveRead(directory);
  const tree: FileSystemTree = {};

  for (const { filePath, contents } of files) {
    const segments = filePath.split("/");

    let currentTree: FileSystemTree = tree;

    for (let i = 0; i < segments.length; i++) {
      const name = segments[i];

      if (i === segments.length - 1) {
        currentTree[name] = { file: { contents } };
      } else {
        let folder = currentTree[name];

        if (!folder || !("directory" in folder)) {
          folder = { directory: {} };
          currentTree[name] = folder;
        }

        currentTree = folder.directory;
      }
    }
  }

  return tree;

  async function recursiveRead(
    dir: string,
  ): Promise<{ filePath: string; contents: string }[]> {
    const files = await readdir(dir);

    const output = await Promise.all(
      files.map(async (file) => {
        const filePath = resolve(dir, file);
        const fileStat = await stat(filePath);

        if (fileStat.isDirectory()) {
          return recursiveRead(filePath);
        }

        return {
          filePath: relative(directory, filePath).replaceAll(sep, "/"),
          contents: await readFile(filePath, "utf-8"),
        };
      }),
    );

    return output.flat();
  }
};
