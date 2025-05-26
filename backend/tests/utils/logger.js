const chalk = require('chalk');

// Funcție helper pentru log-uri formatate
const log = {
  info: (message) => console.log(chalk.cyanBright(`[INFO] ${message}`)),
  success: (message) => console.log(chalk.greenBright(`[SUCCESS] ${message}`)),
  error: (message) => console.log(chalk.redBright(`[ERROR] ${message}`)),
  test: (message) => console.log(chalk.yellowBright(`[TEST] ${message}`)),
  separator: () => console.log(chalk.gray('----------------------------------------')),
};

module.exports = log;