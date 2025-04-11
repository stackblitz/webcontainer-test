import { commands } from "@vitest/browser/context";
import {
  type FileSystemTree,
  WebContainer as WebContainerApi,
} from "@webcontainer/api";

export class WebContainer {
  private _instancePromise?: WebContainerApi;
  private _isReady: Promise<void>;

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

    await process.exit;

    return output.trim();
  }
}
