# @webcontainer/test

[![Version][version-badge]][npm-url]

> Utilities for testing applications in WebContainers

[Installation](#installation) | [Configuration](#configuration) | [API](#api)

---

Test your applications and packages inside WebContainers.

## Installation

Add `@webcontainer/test` to your development dependencies.

```sh
$ npm install --save-dev @webcontainer/test
```

Vitest is also required as peer dependency.

```sh
$ npm install --save-dev vitest @vitest/browser
```

## Configuration

Add `vitestWebcontainers` plugin in your Vitest config and enable browser mode:

```ts
import { defineConfig } from "vitest/config";
import { vitestWebcontainers } from "@webcontainer/test/plugin";

export default defineConfig({
  plugins: [vitestWebcontainers()],
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
```

## API

Webcontainer utilities are exposed as [test fixtures](https://vitest.dev/guide/test-context.html#test-extend).

```ts
import { test } from "@webcontainer/test";

test("run development server inside webcontainer", async ({
  webcontainer,
  preview,
}) => {
  await webcontainer.mount("path/to/project");

  await webcontainer.runCommand("npm", ["install"]);
  webcontainer.runCommand("npm", ["run", "dev"]);

  await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
});
```

#### `preview`

##### `getByRole`

Vitest's [`getByRole`](https://vitest.dev/guide/browser/locators.html#getbyrole) that's scoped to the preview window.

```ts
await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
```

##### `getByText`

Vitest's [`getByText`](https://vitest.dev/guide/browser/locators.html#getbytext) that's scoped to the preview window.

```ts
await preview.getByText("Hello Vite!");
```

#### `webcontainer`

##### `mount`

Mount file system inside webcontainer.

Accepts a path that is relative to the [project root](https://vitest.dev/config/#root), or inlined [`FileSystemTree`](https://webcontainers.io/api#filesystemtree).

```ts
await webcontainer.mount("/path/to/project");
```

##### `runCommand`

Run command inside webcontainer. Returns command output.

```ts
await webcontainer.runCommand("npm", ["install"]);

const files = await webcontainer.runCommand("ls", ["-l"]);
```

[version-badge]: https://img.shields.io/npm/v/@webcontainer/test
[npm-url]: https://www.npmjs.com/package/@webcontainer/test
