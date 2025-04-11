import type {} from "@vitest/browser/context";
import { FileSystemTree } from "@webcontainer/api";

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    readDirectory: (directory: string) => Promise<FileSystemTree>;
  }
}
