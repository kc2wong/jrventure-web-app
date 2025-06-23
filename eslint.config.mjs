import typescriptEslint from '@typescript-eslint/eslint-plugin';
import checkFile from 'eslint-plugin-check-file';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['coverage/'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/index.tsx', 'src/__tests__/**/*'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'check-file': checkFile,
      react,
      'import': importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      quotes: ['error', 'single'],
      curly: ['error', 'all'],

      'no-console': 'error',

      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.ts': 'KEBAB_CASE',
          // '**/*.tsx': 'PASCAL_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],

      // Enforce a consistent order of import statements
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // e.g. fs, path
            'external', // e.g. react, lodash
            'internal', // your aliases
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {
              pattern: '@webapi/**',
              group: 'internal',
            },
            {
              pattern: '@repo/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'react/react-in-jsx-scope': 'off',

      'react/jsx-sort-props': [
        'error',
        {
          ignoreCase: true,
          callbacksLast: false,
          shorthandFirst: false,
          shorthandLast: false,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],

      'react/prop-types': 'off',
    },
  },
];
