import { type Locator, page } from "@vitest/browser/context";

const TEST_ID = "webcontainers-iframe";

export class Preview {
  private _preview: Locator;
  private _iframe?: HTMLIFrameElement;

  constructor() {
    this._preview = page.getByTestId(TEST_ID);
  }

  async setup(url: string) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    iframe.setAttribute("style", "height: 100vh; width: 100vw;");
    iframe.setAttribute("data-testid", TEST_ID);

    document.body.appendChild(iframe);

    this._iframe = iframe;
  }

  async teardown() {
    if (this._iframe) {
      document.body.removeChild(this._iframe);
    }
  }

  async getByRole(...options: Parameters<typeof page.getByRole>) {
    return this._preview.getByRole(...options);
  }

  async getByText(...options: Parameters<typeof page.getByText>) {
    return this._preview.getByText(...options);
  }
}
