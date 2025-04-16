import { WebContainer as WebContainerApi } from "@webcontainer/api";

import { FileSystem } from "./file-system";
import { ProcessWrap } from "./process";

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
   * See [`runCommand` documentation](https://github.com/stackblitz/webcontainer-test#runcommand) for usage examples.
   */
  runCommand(
    command: string,
    args: string[] = [],
  ): PromiseLike<string> & ProcessWrap {
    const proc = new ProcessWrap(
      this._instance.spawn(command, args, { output: true }),
    );

    this._onExit.push(() => proc.exit());

    return proc;
  }
}
