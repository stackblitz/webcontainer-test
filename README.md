# @webcontainer/playwright

[![Version][version-badge]][npm-url]

> Playwright utilities for testing applications in WebContainers

[Installation](#installation) | [API](#api)

---

Test your applications and packages inside WebContainers using Playwright.

## Installation

```sh
$ npm install --save-dev @webcontainer/playwright
```

`@playwright/test` is required as peer dependency:

```sh
$ npm install --save-dev @playwright/test
```

## API

### Fixtures

WebContainer utilities are defined as [Playwright fixtures](https://playwright.dev/docs/test-fixtures). You can import pre-defined `test()`, or import each fixture manually and extend your own `test` with each fixture.

```ts
// Pre-defined test()
import { test } from "@webcontainer/playwright";
```

```ts
// Manual import of each fixture
import {
  Editor,
  Preview,
  Terminal,
  WebContainer,
} from "@webcontainer/playwright";
import { test as base } from "@playwright/test";

const test = base.extend<{
  editor: Editor;
  preview: Preview;
  terminal: Terminal;
  webcontainer: WebContainer;
}>({
  editor: async ({ page }, use) => {
    use(new Editor(page));
  },
  preview: async ({ page }, use) => {
    use(new Preview(page));
  },
  terminal: async ({ page }, use) => {
    use(new Terminal(page));
  },
  webcontainer: async ({ page }, use) => {
    use(new WebContainer(page));
  },
});

export { test };
```

You can access each fixture in your test cases:

```ts
import { test } from "@webcontainer/playwright"; // or your own `test` setup

test("user can open Vite TypeScript starter", async ({
  page,
  editor,
  preview,
  terminal,
}) => {
  await page.goto("/");

  await editor.getByFile("package.json", /"vite": "^6.0.11"/);
  await editor.getByFile("src/main.ts", /<h1>Hello Vite<\/h1>/);

  await terminal.getByText("VITE v6.0.11 ready");

  await preview.getByRole("heading", { level: 1, name: "Hello Vite" });
});
```

#### Editor

##### `getByFile`

Get file by its name and content.

```ts
async function getByFile(filename: string, content: RegExp | string): Locator;
```

#### Preview

##### `getByRole`

Playwright's [`getByRole`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-role) that's scoped to the preview `<iframe>`.

#### Terminal

##### `getByText`

Playwright's [`getByText`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-role) that's scoped to the terminal.

#### WebContainer

##### `runCommand`

Run command inside WebContainer process.

```ts
async function runCommand(command: string): Promise<void>;
```

[version-badge]: https://img.shields.io/npm/v/@webcontainer/playwright
[npm-url]: https://www.npmjs.com/package/@webcontainer/playwright
