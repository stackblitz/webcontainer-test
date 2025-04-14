import { test } from "../src";

test("user can see server output in preview", async ({
  webcontainer,
  preview,
}) => {
  await webcontainer.mount("test/fixtures/starter-vite");

  await webcontainer.runCommand("npm", ["install"]);
  void webcontainer.runCommand("npm", ["run", "dev"]);

  await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
});

test("user can see HMR changes in preview", async ({
  webcontainer,
  preview,
}) => {
  await webcontainer.mount("test/fixtures/starter-vite");

  await webcontainer.runCommand("npm", ["install"]);
  void webcontainer.runCommand("npm", ["run", "dev"]);

  await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });

  const content = await webcontainer.readFile("/src/main.js");

  await webcontainer.writeFile(
    "/src/main.js",
    content.replace("Hello Vite!", "Modified title!"),
  );

  await preview.getByRole("heading", { level: 1, name: "Modified title!" });
});
