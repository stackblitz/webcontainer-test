import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    plugin: "src/plugin.ts",
  },
  outDir: "dist",
  format: ["esm"],
  tsconfig: "./tsconfig.json",
  target: "esnext",
  clean: true,
  dts: true,
});
