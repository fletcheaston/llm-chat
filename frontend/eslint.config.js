import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    globalIgnores(["dist/*", "src/api/*"]),
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { js },
        languageOptions: { globals: globals.browser },
        extends: [
            "js/recommended",
            tseslint.configs.recommended,
            pluginReact.configs.flat["jsx-runtime"],
        ],
        rules: {
            "func-style": ["error", "declaration"],
            "react/no-unescaped-entities": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
]);
