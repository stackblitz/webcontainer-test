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
  const { exit } = webcontainer.runCommand("npm", ["run", "dev"]);

  await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
  await exit();
});
```

To use test hooks, you can import fixture typings:

```ts
import { test, type TestContext } from "@webcontainer/test";
import { beforeEach } from "vitest";

// Mount project before each test
beforeEach<TextContext>(({ webcontainer }) => {
  await webcontainer.mount("projects/example");
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

##### `locator`

Vitest's [`locator`](https://vitest.dev/guide/browser/locators.html) of the preview window.

```ts
await preview.locator.hover();
```

#### `webcontainer`

##### `mount`

Mount file system inside webcontainer.

Accepts a path that is relative to the [project root](https://vitest.dev/config/#root), or inlined [`FileSystemTree`](https://webcontainers.io/api#filesystemtree).

```ts
await webcontainer.mount("/path/to/project");

await webcontainer.mount({
  "package.json": { file: { contents: '{ "name": "example-project" }' } },
  src: {
    directory: {
      "index.ts": { file: { contents: "export default 'Hello!';" } },
    },
  },
});
```

##### `runCommand`

Run command inside webcontainer.

```ts
await webcontainer.runCommand("npm", ["install"]);
```

Calling `await` on the result resolves into the command output:

```ts
const files = await webcontainer.runCommand("ls", ["-l"]);
```

To write into the output stream, use `write` method of the non-awaited output.

To verify output of continuous stream, use `waitForText()`:

```ts
const { write, waitForText, exit } = webcontainer.runCommand("npm", [
  "create",
  "vite",
]);

await waitForText("What would you like to call your project?");
await write("Example Project\n");

await waitForText("Where should the project be created?");
await write("./example-project\n");

await exit();
```

##### `readFile`

WebContainer's [`readFile`](https://webcontainers.io/guides/working-with-the-file-system#readfile) method.

```ts
const content = await webcontainer.readFile("/package.json");
```

##### `writeFile`

WebContainer's [`writeFile`](https://webcontainers.io/guides/working-with-the-file-system#writefile) method.

```ts
await webcontainer.writeFile("/main.ts", "console.log('Hello world!')");
```

##### `rename`

WebContainer's [`rename`](https://webcontainers.io/guides/working-with-the-file-system#rename) method.

```ts
await webcontainer.rename("/before.ts", "/after.ts");
```

##### `mkdir`

WebContainer's [`mkdir`](https://webcontainers.io/guides/working-with-the-file-system#mkdir) method.

```ts
await webcontainer.mkdir("/src/components");
```

##### `readdir`

WebContainer's [`readdir`](https://webcontainers.io/guides/working-with-the-file-system#readdir) method.

```ts
const contents = await webcontainer.readdir("/src");
```

##### `rm`

WebContainer's [`rm`](https://webcontainers.io/guides/working-with-the-file-system#rm) method.

```ts
await webcontainer.rm("/node_modules");
```

[version-badge]: https://img.shields.io/npm/v/@webcontainer/test
[npm-url]: https://www.npmjs.com/package/@webcontainer/test
