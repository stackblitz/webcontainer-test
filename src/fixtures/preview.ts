import { type Locator, page } from "vitest/browser";

const TEST_ID = "webcontainers-iframe";

export class Preview {
  /** @internal */
  private _preview: Locator;

  /** @internal */
  private _iframe?: HTMLIFrameElement;

  constructor() {
    this._preview = page.getByTestId(TEST_ID);
  }

  /** @internal */
  async setup(url: string) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    iframe.setAttribute("style", "height: 100vh; width: 100vw;");
    iframe.setAttribute("data-testid", TEST_ID);

    document.body.appendChild(iframe);

    this._iframe = iframe;
  }

  /** @internal */
  async teardown() {
    if (this._iframe) {
      document.body.removeChild(this._iframe);
    }
  }

  /**
   * Vitest's [`getByRole`](https://vitest.dev/guide/browser/locators.html#getbyrole) that's scoped to the preview window.
   */
  async getByRole(...options: Parameters<typeof page.getByRole>) {
    return this._preview.getByRole(...options);
  }

  /**
   * Vitest's [`getByText`](https://vitest.dev/guide/browser/locators.html#getbytext) that's scoped to the preview window.
   */
  async getByText(...options: Parameters<typeof page.getByText>) {
    return this._preview.getByText(...options);
  }

  /**
   * Vitest's [`locator`](https://vitest.dev/guide/browser/locators.html) of the preview window.
   */
  get locator() {
    return this._preview;
  }
}
