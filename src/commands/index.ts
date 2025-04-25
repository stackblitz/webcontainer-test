import { resolve } from "node:path";
import { snapshot } from "@webcontainer/snapshot";
import type { BrowserCommand } from "vitest/node";

// custom command to read directories from browser context. Used for mounting directories inside webcontainer
export const readDirectory: BrowserCommand<[directory: string]> = async (
  context,
  directory,
): Promise<string> => {
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

  const tree = await snapshot(directory);

  return tree.toString("base64");
};
