import chalk from "chalk";

enum LogLevel {
  LOG = 0,
  WARN = 1,
  ERROR = 2,
}

class LoggerChain {
  private parts: string[] = [];
  private level: LogLevel = LogLevel.LOG;

  constructor(level: LogLevel) {
    this.level = level;
  }

  public info(message: string): this {
    this.parts.push(chalk.cyan(message));
    return this;
  }

  public success(message: string): this {
    this.parts.push(chalk.green(message));
    return this;
  }

  public warn(message: string): this {
    this.parts.push(chalk.yellow(message));
    this.level = Math.max(this.level, LogLevel.WARN);
    return this;
  }

  public error(message: string): this {
    this.parts.push(chalk.red(message));
    this.level = LogLevel.ERROR;
    return this;
  }

  public detail(message: string): this {
    this.parts.push(chalk.gray(message));
    return this;
  }

  public print(): void {
    const output = this.parts.join("");
    switch (this.level) {
      case LogLevel.LOG:
        console.log(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
        console.error(output);
        break;
    }
  }
}

export const logger = {
  info: (message: string) => new LoggerChain(LogLevel.LOG).info(message),
  success: (message: string) => new LoggerChain(LogLevel.LOG).success(message),
  warn: (message: string) => new LoggerChain(LogLevel.WARN).warn(message),
  error: (message: string) => new LoggerChain(LogLevel.ERROR).error(message),
  detail: (message: string) => new LoggerChain(LogLevel.LOG).detail(message),
};
