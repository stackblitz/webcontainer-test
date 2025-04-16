import { commands } from "@vitest/browser/context";
import type {
  FileSystemTree,
  BufferEncoding,
  WebContainer,
} from "@webcontainer/api";

export class FileSystem {
  /** @internal */
  protected get _instance(): WebContainer {
    throw new Error("_instance should be overwritten");
  }

  /**
   * Mount file directory into WebContainer.
   * `string` arguments are considered paths that are relative to [`root`](https://vitest.dev/config/#root)
   */
  async mount(filesOrPath: string | FileSystemTree) {
    if (typeof filesOrPath === "string") {
      filesOrPath = await commands.readDirectory(filesOrPath);
    }

    return await this._instance.mount(filesOrPath as FileSystemTree);
  }

  /**
   * WebContainer's [`readFile`](https://webcontainers.io/guides/working-with-the-file-system#readfile) method.
   */
  async readFile(path: string, encoding: BufferEncoding = "utf8") {
    return this._instance.fs.readFile(path, encoding);
  }

  /**
   * WebContainer's [`writeFile`](https://webcontainers.io/guides/working-with-the-file-system#writefile) method.
   */
  async writeFile(path: string, data: string, encoding = "utf8") {
    return this._instance.fs.writeFile(path, data, { encoding });
  }

  /**
   * WebContainer's [`rename`](https://webcontainers.io/guides/working-with-the-file-system#rename) method.
   */
  async rename(oldPath: string, newPath: string) {
    return this._instance.fs.rename(oldPath, newPath);
  }

  /**
   * WebContainer's [`mkdir`](https://webcontainers.io/guides/working-with-the-file-system#mkdir) method.
   */
  async mkdir(path: string) {
    return this._instance.fs.mkdir(path);
  }

  /**
   * WebContainer's [`readdir`](https://webcontainers.io/guides/working-with-the-file-system#readdir) method.
   */
  async readdir(path: string) {
    return this._instance.fs.readdir(path);
  }

  /**
   * WebContainer's [`rm`](https://webcontainers.io/guides/working-with-the-file-system#rm) method.
   */
  async rm(path: string) {
    return this._instance.fs.rm(path);
  }
}
