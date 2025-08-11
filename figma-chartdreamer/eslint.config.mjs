import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        figma: 'readonly',
        __html__: 'readonly',
        __uiFiles__: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react-hooks': reactHooks
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^h$'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-undef': 'off' // TypeScript handles this
    },
    settings: {
      react: {
        pragma: 'h',
        version: '17.0'
      }
    }
  },
  {
    ignores: ['build/**', 'node_modules/**', '*.config.js', 'build-figma-plugin.*.js', 'manifest.json']
  }
]
