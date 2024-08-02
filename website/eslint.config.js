module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        browser: true,
        jest: true,
        node: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: require('eslint-plugin-react'),
      prettier: require('eslint-plugin-prettier'),
      'unused-imports': require('eslint-plugin-unused-imports'),
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
          printWidth: 80,
          tabWidth: 2,
          semi: true,
          endOfLine: 'lf',
          bracketSpacing: true,
          jsxBracketSameLine: false,
        },
      ],
      'react/prop-types': 'off',
      'react/jsx-filename-extension': 0,
      'react/jsx-one-expression-per-line': 0,
      'react/jsx-indent': 0,
      'react/react-in-jsx-scope': 'off',
      'no-console': ['warn'],
      'no-undef': ['warn'],
      'no-irregular-whitespace': ['warn'],
      'no-constant-condition': ['warn'],
      'no-empty': ['warn'],
      'no-prototype-builtins': ['warn'],
      'no-async-promise-executor': ['warn'],
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    ignores: ['**/static/', '**/node_modules', '**/templates/', '**/venv/'],
  },
];
