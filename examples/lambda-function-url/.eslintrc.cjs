module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
    'plugin:react/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true, // required when specifying parserOptions.project
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
    next: {
      rootDir: 'packages/ui',
    },
  },
  plugins: ['@typescript-eslint', '@tanstack/query'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@tanstack/query/prefer-query-object-syntax': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    semi: ['error', 'never'],
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error'],
      },
    ],
    'react/no-unknown-property': [
      'error',
      {
        ignore: ['jsx', 'global'],
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': [
      'error',
      {
        allowReferrer: true,
      },
    ],
    '@next/next/no-img-element': 'off',
  },
}
