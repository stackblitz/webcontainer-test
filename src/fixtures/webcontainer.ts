import { WebContainer as WebContainerApi } from "@webcontainer/api";
import { FileSystem } from "./file-system";

export class WebContainer extends FileSystem {
  /** @internal */
  private _instancePromise?: WebContainerApi;

  /** @internal */
  private _isReady: Promise<void>;

  /** @internal */
  private _onExit: (() => Promise<unknown>)[] = [];

  constructor() {
    super();

    this._isReady = WebContainerApi.boot({}).then((instance) => {
      this._instancePromise = instance;
    });
  }

  /** @internal */
  protected get _instance(): WebContainerApi {
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
}
