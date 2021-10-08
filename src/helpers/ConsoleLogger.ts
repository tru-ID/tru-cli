import ILogger from './ILogger'

export enum LogLevel {
  error = 0,
  warn = 1,
  info = 2,
  debug = 3,
}

/**
 * Logs messages to the {@link console}.
 *
 * By default logs at {@link LogLevel.info}.
 */
export class ConsoleLogger implements ILogger {
  loglevel: LogLevel

  constructor(loglevel: LogLevel = LogLevel.info) {
    this.loglevel = loglevel
  }

  debug(message?: any, ...optionalParams: any[]): void {
    if (this.loglevel >= LogLevel.debug) {
      global.console.debug(message, ...optionalParams)
    }
  }

  info(message?: any, ...optionalParams: any[]): void {
    if (this.loglevel >= LogLevel.info) {
      global.console.info(message, ...optionalParams)
    }
  }

  warn(message?: any, ...optionalParams: any[]): void {
    if (this.loglevel >= LogLevel.warn) {
      global.console.warn(message, ...optionalParams)
    }
  }

  error(message?: any, ...optionalParams: any[]): void {
    if (this.loglevel >= LogLevel.error) {
      global.console.error(message, ...optionalParams)
    }
  }
}
