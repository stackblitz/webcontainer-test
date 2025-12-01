import type {} from "vitest/browser";

declare module "vitest/browser" {
  interface BrowserCommands {
    readDirectory: (directory: string) => Promise<string>;
  }
}
