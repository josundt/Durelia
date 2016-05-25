import * as durandalSystem from "durandal/system";
import {singleton, inject} from "durelia-dependency-injection";

type LogAppender = (message: string, ...properties: any[]) => void;

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
    constructor() {
        this.severityThreshold = durandalSystem.debug()
            ? SeverityLevel.debug
            : SeverityLevel.warn;
    }

    /** @internal */
    private severityThreshold: SeverityLevel = SeverityLevel.debug;
    
    /** @internal */
    private log(severityLevel: SeverityLevel = SeverityLevel.debug, appender: ILogger, appenderFn: LogAppender, message: string,  ...properties: any[]) {
        if (severityLevel >= this.severityThreshold) {
            /* tslint:disable:no-console */
            appenderFn.call(appender, message, ...properties);
            /* tslint:enable:no-console */
        }
    }
    
    debug(message: string, ...properties: any[]) { this.log(SeverityLevel.debug, console, console.debug, message, ...properties); }
    info(message: string, ...properties: any[])  { this.log(SeverityLevel.info,  console, console.info, message, ...properties); }
    warn(message: string, ...properties: any[])  { this.log(SeverityLevel.warn,  console, console.warn, message, ...properties); }
    error(message: string, ...properties: any[]) { this.log(SeverityLevel.error, console, console.error, message, ...properties); }
}