import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    { ignores: ['build/*.js'] },
    { files: ['**/*.{js,mjs,cjs}'] },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
        rules: {
            'prettier/prettier': [
                'error',
                {
                    tabWidth: 4,
                    singleQuote: true,
                },
            ],
        },
    },
    { settings: { node: { version: '>=16.0.0' } } },
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
]);
