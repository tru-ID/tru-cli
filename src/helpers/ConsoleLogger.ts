import ILogger from './ILogger'

export enum LogLevel {
    info = 0,
    debug = 1,
}

/**
 * Logs messages to the {@link console}.
 * 
 * By default logs at {@link LogLevel.info}.
 */
export class ConsoleLogger implements ILogger {
    loglevel: LogLevel

    constructor(loglevel:LogLevel = LogLevel.info) {
        this.loglevel = loglevel
    }

    info(message?: any, ...optionalParams: any[]): void {
        if(this.loglevel >= LogLevel.info) {
            global.console.info(message, ...optionalParams)
        }
    }

    debug(message?: any, ...optionalParams: any[]): void {
        if(this.loglevel >= LogLevel.debug) {
            global.console.debug(message, ...optionalParams)
        }
    }
}