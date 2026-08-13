import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['out/**', 'dist/**', 'release/**', 'node_modules/**', '**/*.d.ts'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    plugins: { 'react-refresh': reactRefresh },
    languageOptions: {
      globals: { ...globals.browser }
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  },
  {
    files: ['src/main/**/*.ts', 'src/preload/**/*.ts', 'electron.vite.config.ts'],
    languageOptions: {
      globals: { ...globals.node }
    }
  },
  {
    // Release tooling. Plain Node ES modules run with `node`, never bundled and
    // never part of the packaged app.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node }
    }
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // React Compiler optimization hints from react-hooks v7. These are advisory
      // performance suggestions rather than correctness bugs, so they are warnings
      // here while the critical rules-of-hooks stays an error.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn'
    }
  },
  prettier
)
