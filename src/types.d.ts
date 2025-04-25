import type {} from "@vitest/browser/context";

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    readDirectory: (directory: string) => Promise<string>;
  }
}
