export default interface ILogger {
    /**
     * The {@link console.info()} function is an alias for {@link console.log()}.
     */
    info(message?: any, ...optionalParams: any[]): void

    /**
     * The `console.debug()` function is an alias for {@link console.log()}.
     */
    debug(message?: any, ...optionalParams: any[]): void

    /**
     * The `console.error()` function is an alias for {@link console.log()}.
     */
    error(message?: any, ...optionalParams: any[]): void

    /**
     * The `console.warn()` function is an alias for {@link console.warn()}.
     */
    warn(message?: any, ...optionalParams: any[]): void    
}