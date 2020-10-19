const escape = require('shell-quote').quote;
const isWin = process.platform === 'win32';

module.exports = {
  '**/*.{js,ts}': (filenames) => {
    const escapedFileNames = filenames.map((filename) => `"${isWin ? filename : escape([filename])}"`).join(' ');
    return [
      `prettier --with-node-modules --write ${escapedFileNames}`,
      `eslint --no-ignore --max-warnings=0 --fix ${filenames.map((f) => `"${f}"`).join(' ')}`,
    ];
  },
  '**/*.{json,md,mdx,css,html,yml,yaml,scss}': (filenames) => {
    const escapedFileNames = filenames.map((filename) => `"${isWin ? filename : escape([filename])}"`).join(' ');
    return [`prettier --with-node-modules --ignore-path --write ${escapedFileNames}`];
  },
};
