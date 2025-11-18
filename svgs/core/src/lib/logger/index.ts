import chalk from "chalk";

function info(message: string): void {
  console.log(chalk.cyan("[INFO]"), message);
}

function warn(message: string): void {
  console.warn(chalk.yellow("[WARN]"), message);
}

function error(message: string): void {
  console.error(chalk.red("[ERROR]"), message);
}

export const logger = {
  info,
  warn,
  error,
};
