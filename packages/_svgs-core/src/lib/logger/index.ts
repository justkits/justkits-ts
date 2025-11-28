import chalk from "chalk";

function info(message: string): void {
  console.log(chalk.cyan(message));
}

function warn(message: string): void {
  console.warn("⚠️", chalk.yellow(message));
}

function error(message: string): void {
  console.error("❌", chalk.red(message));
}

function success(message: string): void {
  console.log("✅", chalk.green(message));
}

export const logger = {
  info,
  warn,
  error,
  success,
};
