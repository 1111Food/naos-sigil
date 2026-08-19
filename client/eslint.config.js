import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Warn on console statements left in production code
      'no-console': 'warn',
      // Warn on TypeScript `any` usage — encourages proper typing
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow named exports alongside components (common in NAOS)
      'react-refresh/only-export-components': 'off',
    },
  },
])
