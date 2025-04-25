import { WebContainerProcess } from "@webcontainer/api";

export class ProcessWrap {
  /** @internal */
  private _webcontainerProcess!: WebContainerProcess;

  /** @internal */
  private _isReady: Promise<void>;

  /** @internal */
  private _output: string = "";

  /** @internal */
  private _listeners: ((chunk: string) => void)[] = [];

  /** @internal */
  private _writer?: ReturnType<WebContainerProcess["input"]["getWriter"]>;

  /**
   * Wait for process to exit.
   */
  isDone: Promise<void>;

  constructor(promise: Promise<WebContainerProcess>) {
    let isExitted = false;
    let setDone: () => void = () => undefined;

    this.isDone = new Promise((resolve) => {
      setDone = () => {
        resolve();
        isExitted = true;
      };
    });

    this._isReady = promise.then((webcontainerProcess) => {
      this._webcontainerProcess = webcontainerProcess;
      this._writer = webcontainerProcess.input.getWriter();

      webcontainerProcess.exit.then(setDone);

      const reader = this._webcontainerProcess.output.getReader();

      const read = async () => {
        while (true) {
          const { done, value } = await reader.read();

          if (isExitted && !done) {
            console.warn(
              `[webcontainer-test]: Closed process keeps writing to output. Closing reader forcefully. \n` +
                `                     Received: "${value}".`,
            );
            await reader.cancel();
            break;
          }

          // webcontainer process never reaches here, but for future-proofing let's exit
          if (done) {
            break;
          }

          this._output += value;
          this._listeners.forEach((fn) => fn(value));
        }
      };

      void read();
    });
  }

  then<TResult1 = string, TResult2 = never>(
    onfulfilled?: ((value: string) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.isDone
      .then(() => this._output.trim())
      .then(onfulfilled, onrejected);
  }

  /**
   * Write command into the process.
   */
  write = async (text: string) => {
    await this._isReady;

    this.resetCapturedText();

    if (!this._writer) {
      throw new Error("Process setup failed, writer not initialized");
    }

    return this._writer.write(text);
  };

  /**
   * Reset captured output, so that `waitForText` does not match previous captured outputs.
   */
  resetCapturedText = () => {
    this._output = "";
  };

  /**
   * Wait for process to output expected text.
   */
  waitForText = async (expected: string, timeoutMs = 10_000) => {
    const error = new Error("Timeout");

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(error, this.waitForText);
    }

    await this._isReady;

    return new Promise<void>((resolve, reject) => {
      if (this._output.includes(expected)) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        error.message = `Timeout when waiting for text "${expected}".\nReceived:\n${this._output.trim()}`;
        reject(error);
      }, timeoutMs);

      const listener = () => {
        if (this._output.includes(expected)) {
          clearTimeout(timeout);
          this._listeners.splice(this._listeners.indexOf(listener), 1);

          resolve();
        }
      };

      this._listeners.push(listener);
    });
  };

  /**
   * Listen for data stream chunks.
   */
  onData = (listener: (chunk: string) => void) => {
    this._listeners.push(listener);
  };

  /**
   * Exit the process.
   */
  exit = async () => {
    await this._isReady;

    this._webcontainerProcess.kill();
    this._listeners.splice(0);

    return this.isDone;
  };
}
