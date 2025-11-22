import { defineConfig } from 'eslint-define-config';
// Import the React plugin and React Hooks plugin
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    languageOptions: {
      globals: {
        // Define global variables that you want ESLint to recognize
        // Example: 'React': 'readonly'
      },
      parserOptions: {
        ecmaVersion: 12, // ES2021
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect', // Automatically detects React version
      },
    },
    plugins: {
      react: eslintPluginReact,  // Import the react plugin object
      'react-hooks': eslintPluginReactHooks,  // Import the react-hooks plugin object
    },
    rules: {
      'no-redeclare': 'off',
      'no-irregular-whitespace': 'off',
      'no-control-regex': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'no-self-assign': 'off',
      'react/jsx-key': 'off',
      'react/react-in-jsx-scope': 'off', // React 17+ no longer requires this
      'react/no-unknown-property': 'off',
      'react/jsx-no-target-blank': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-unsafe-optional-chaining': 'off',
      'no-const-assign': 'off',
      'react/no-unescaped-entities': 'off',
      'no-extra-semi': 'off',
      'no-case-declarations': 'off',
      'no-extra-boolean-cast': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-catch': 'off',
      'no-undef': 'off',
      'indent': 'off',
      'no-unused-vars': 'off',
      'react/prop-types': 'off',
    },
  },
]);
