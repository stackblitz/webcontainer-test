import { commands } from "@vitest/browser/context";
import {
  type BufferEncoding,
  type FileSystemTree,
  WebContainer as WebContainerApi,
} from "@webcontainer/api";

export class WebContainer {
  private _instancePromise?: WebContainerApi;
  private _isReady: Promise<void>;
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

  async wait() {
    await this._isReady;
  }

  onServerReady(callback: (options: { port: number; url: string }) => void) {
    this._instance.on("server-ready", (port, url) => {
      callback({ port, url });
    });
  }

  /**
   * Mount file directory into webcontainer.
   * `string` arguments are considered paths that are relative to [`root`](https://vitest.dev/config/#root)
   */
  async mount(filesOrPath: string | FileSystemTree) {
    if (typeof filesOrPath === "string") {
      filesOrPath = await commands.readDirectory(filesOrPath);
    }

    return await this._instance.mount(filesOrPath as FileSystemTree);
  }

  async teardown() {
    await Promise.all(this._onExit.map((fn) => fn()));

    // @ts-ignore -- internal
    await this._instance._instance.teardown();

    this._instance.teardown();
    this._instancePromise = undefined;
  }

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

  async readFile(path: string, encoding: BufferEncoding = "utf8") {
    return this._instance.fs.readFile(path, encoding);
  }

  async writeFile(path: string, data: string, encoding = "utf8") {
    return this._instance.fs.writeFile(path, data, { encoding });
  }

  async rename(oldPath: string, newPath: string) {
    return this._instance.fs.rename(oldPath, newPath);
  }

  async mkdir(path: string) {
    return this._instance.fs.mkdir(path);
  }

  async readdir(path: string) {
    return this._instance.fs.readdir(path);
  }

  async rm(path: string) {
    return this._instance.fs.rm(path);
  }
}
