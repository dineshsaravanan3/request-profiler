// @ts-nocheck
// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper functions to colorize text
function colorize(color, text) {
  return `${color}${text}${colors.reset}`;
}

module.exports = {
  red: (text) => colorize(colors.red, text),
  green: (text) => colorize(colors.green, text),
  yellow: (text) => colorize(colors.yellow, text),
  blue: (text) => colorize(colors.blue, text),
  magenta: (text) => colorize(colors.magenta, text),
  cyan: (text) => colorize(colors.cyan, text),
  white: (text) => colorize(colors.white, text),
  dim: (text) => colorize(colors.dim, text),
  bright: (text) => colorize(colors.bright, text)
};