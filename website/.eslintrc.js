module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react'],
  ignorePatterns: ['**/static/', '**node_modules', '**/templates/', '**/venv/'],
  rules: {
    'react/jsx-filename-extension': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-indent': 0,
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['warn'],
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto'
      }
    ]
  }
};
