const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'),
);

module.exports = {
    parser: 'babel-eslint',
    extends: ['prettier'],
    plugins: ['prettier'],
    env: {
        jest: true,
        browser: true,
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': ['error', prettierOptions],
        'arrow-body-style': [2, 'as-needed'],
        'class-methods-use-this': 0,
        indent: [
            2,
            2,
            {
                SwitchCase: 1,
            },
        ],
        'max-len': 0,
        'newline-per-chained-call': 0,
        'no-confusing-arrow': 0,
        'no-console': 1,
        'no-unused-vars': 2,
        'no-use-before-define': 0,
        'no-underscore-dangle': 0,
        'prefer-template': 2,
    },
};
