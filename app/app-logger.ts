import {singleton} from "framework/dependency-injection";

export interface ILogger {
    debug(message: string, ...properties: any[]);
    info(message: string, ...properties: any[]);
    warn(message: string, ...properties: any[]);
    error(message: string, ...properties: any[]);
} 

export enum SeverityLevel {
    none, 
    error,
    warn,
    info,
    debug
}

@singleton
export class Logger implements ILogger {

    severityThreshold: SeverityLevel = SeverityLevel.debug;
    
    private log(message: string, severityLevel: SeverityLevel = SeverityLevel.debug, ...properties: any[]) {
        if (severityLevel >= this.severityThreshold) {
            /* tslint:disable:no-console */
            console.log(message, ...properties);            
            /* tslint:enable:no-console */
        }
    }
    
    debug(message: string, ...properties: any[]) { this.log(message, SeverityLevel.debug, ...properties); }
    info(message: string, ...properties: any[]) { this.log(message, SeverityLevel.info, ...properties); }
    warn(message: string, ...properties: any[]) { this.log(message, SeverityLevel.warn, ...properties); }
    error(message: string, ...properties: any[]) { this.log(message, SeverityLevel.error, ...properties); }
}