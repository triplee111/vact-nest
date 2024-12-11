module.exports = {
  root: true,
  env: {
    es6: true,
    jquery: true,
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    // enforce consistent indentation
    indent: [2, 2, { SwitchCase: 1 }],
    // allow paren-less arrow functions
    'arrow-parens': [2, 'as-needed'],
    // enforce spacing around the * in generator functions
    'generator-star-spacing': 2,
    // forbid the use of extraneous packages, need package.json
    'import/no-extraneous-dependencies': 0,
    // enforce require on the top-level module scope
    'global-require': 0,
    // require or disallow a space before function parenthesis
    'space-before-function-paren': [
      2,
      { anonymous: 'never', named: 'never', asyncArrow: 'always' }
    ],
    // disallow Undeclared Variables
    'no-undef': 2,
    // disallow Unused Variables
    'no-unused-vars': [
      1,
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false }
    ],
    // allow console during development
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
    // allow debug during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // disallow trailing commas
    'comma-dangle': [2, 'never'],
    // allow to use all of the TypeScript directives.
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    // explicit return and argument types on exported function and class public methods
    '@typescript-eslint/explicit-module-boundary-types': 0,
    // disallow usage of the any type
    '@typescript-eslint/no-explicit-any': 0,
    // specific member delimiter style for interfaces and type literals
    '@typescript-eslint/member-delimiter-style': [0, {
      multiline: {
        delimiter: 'none',
        requireLast: false
      },
      singleline: {
        delimiter: 'none',
        requireLast: false
      }
    }]
  }
}
