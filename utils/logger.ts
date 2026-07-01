/**
 * Minimal, dependency-free logger used across page objects and tests.
 *
 * Output is written to stdout/stderr so it shows up in the Playwright runner
 * output and in CI logs. The active level can be controlled with the
 * LOG_LEVEL env var (debug | info | warn | error). Default is "info".
 */

export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
}

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

function resolveLevel(): LogLevel {
  switch ((process.env.LOG_LEVEL || '').toLowerCase()) {
    case 'debug':
      return LogLevel.DEBUG;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    case 'info':
    default:
      return LogLevel.INFO;
  }
}

export class Logger {
  private readonly scope: string;
  private readonly level: LogLevel;

  constructor(scope = 'test') {
    this.scope = scope;
    this.level = resolveLevel();
  }

  /** Create a child logger with a more specific scope (e.g. a page name). */
  child(scope: string): Logger {
    return new Logger(`${this.scope}:${scope}`);
  }

  debug(message: string, ...meta: unknown[]): void {
    this.write(LogLevel.DEBUG, message, meta);
  }

  info(message: string, ...meta: unknown[]): void {
    this.write(LogLevel.INFO, message, meta);
  }

  warn(message: string, ...meta: unknown[]): void {
    this.write(LogLevel.WARN, message, meta);
  }

  error(message: string, ...meta: unknown[]): void {
    this.write(LogLevel.ERROR, message, meta);
  }

  private write(level: LogLevel, message: string, meta: unknown[]): void {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const line = `${timestamp} [${LEVEL_NAMES[level]}] (${this.scope}) ${message}`;
    const extra = meta.length ? meta : [];

    if (level >= LogLevel.WARN) {
      console.error(line, ...extra);
    } else {
      console.log(line, ...extra);
    }
  }
}

/** Shared root logger. Prefer `logger.child('SomeScope')` in modules. */
export const logger = new Logger();