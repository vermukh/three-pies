import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".codex/**",
    ".agents/**",
    ".aws/**",
    ".idea/**",
    ".vscode/**",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}"],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: "latest" },
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ["client/src/**/*.{ts,tsx}", "packages/ui-kit/src/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: [
      "**/*.config.{ts,mjs}",
      "client/scripts/**/*.mjs",
      "tests/**/*.{ts,mjs}",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright callbacks and asset rendering execute inside the browser.
    files: ["tests/**/*.spec.ts", "client/scripts/export-brand-assets.mjs"],
    languageOptions: { globals: globals.browser },
  },
  prettier,
]);
