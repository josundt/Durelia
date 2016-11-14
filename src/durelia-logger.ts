import * as durandalSystem from "durandal/system";
import {singleton} from "durelia-dependency-injection";

export type LogAppender = (message: string, ...properties: any[]) => void;

export interface ILogger {
    debug: LogAppender; 
    info: LogAppender;
    warn: LogAppender;
    error: LogAppender;
} 

enum SeverityLevel {
    none, 
    debug,
    info,
    warn,
    error
}

@singleton
export class Logger implements ILogger {
    /** @internal */
    private get severityThreshold(): SeverityLevel {
        return durandalSystem.debug() ? SeverityLevel.debug : SeverityLevel.warn;
    }
    
    /**
     * Internal log method
     * @internal
     * @private
     * @param {SeverityLevel} [severityLevel=SeverityLevel.debug] The severity level
     * @param {ILogger} appender Appender
     * @param {LogAppender} appenderFn Appender function
     * @param {string} message Message
     * @param {...any[]} properties Additional properties
     * @returns {void}
     * @memberOf Logger
     */
    private log(severityLevel: SeverityLevel = SeverityLevel.debug, appender: ILogger, appenderFn: LogAppender, message: string,  ...properties: any[]): void {
        if (severityLevel >= this.severityThreshold) {
            /* tslint:disable:no-console */
            appenderFn.call(appender, message, ...properties);
            /* tslint:enable:no-console */
        }
    }
    
    debug(message: string, ...properties: any[]): void { this.log(SeverityLevel.debug, console, console.debug, message, ...properties); }
    info(message: string, ...properties: any[]): void  { this.log(SeverityLevel.info,  console, console.info, message, ...properties); }
    warn(message: string, ...properties: any[]): void  { this.log(SeverityLevel.warn,  console, console.warn, message, ...properties); }
    error(message: string, ...properties: any[]): void { this.log(SeverityLevel.error, console, console.error, message, ...properties); }
}