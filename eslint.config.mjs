import blitzPlugin from "@blitz/eslint-plugin";
import { jsFileExtensions } from "@blitz/eslint-plugin/dist/configs/javascript.js";
import { tsFileExtensions } from "@blitz/eslint-plugin/dist/configs/typescript.js";

export default [
  { ignores: ["**/dist", "**/node_modules", ".cache"] },

  ...blitzPlugin.configs.recommended(),

  {
    files: [...tsFileExtensions, ...jsFileExtensions],
  },
];
