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
