import { commands } from "@vitest/browser/context";
import {
  type BufferEncoding,
  type FileSystemTree,
  WebContainer as WebContainerApi,
} from "@webcontainer/api";

export class WebContainer {
  /** @internal */
  private _instancePromise?: WebContainerApi;

  /** @internal */
  private _isReady: Promise<void>;

  /** @internal */
  private _onExit: (() => Promise<unknown>)[] = [];

  constructor() {
    this._isReady = WebContainerApi.boot({}).then((instance) => {
      this._instancePromise = instance;
    });
  }

  private get _instance(): WebContainerApi {
    if (!this._instancePromise) {
      throw new Error(
        "Webcontainer is not yet ready, make sure to call wait() after creation",
      );
    }

    return this._instancePromise;
  }

  /** @internal */
  async wait() {
    await this._isReady;
  }

  /** @internal */
  onServerReady(callback: (options: { port: number; url: string }) => void) {
    this._instance.on("server-ready", (port, url) => {
      callback({ port, url });
    });
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

  /** @internal */
  async teardown() {
    await Promise.all(this._onExit.map((fn) => fn()));

    // @ts-ignore -- internal
    await this._instance._instance.teardown();

    this._instance.teardown();
    this._instancePromise = undefined;
  }

  /**
   * Run command inside WebContainer.
   * Returns the output of the command.
   */
  async runCommand(command: string, args: string[] = []) {
    let output = "";

    const process = await this._instance.spawn(command, args, { output: true });

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      }),
    );

    // make sure any long-living processes are terminated before teardown, e.g. "npm run dev" commands
    this._onExit.push(() => {
      // @ts-ignore -- internal
      if (process._process != null) {
        process.kill();
      }

      return process.exit;
    });

    await process.exit;

    return output.trim();
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
