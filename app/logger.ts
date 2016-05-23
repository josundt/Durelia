import {singleton} from "dependency-injection";

export interface ILogger {
    debug(message: string, ...properties: any[]);
    info(message: string, ...properties: any[]);
    warn(message: string, ...properties: any[]);
    error(message: string, ...properties: any[]);
} 

export enum SeverityLevel {
    Debug,
    Info,
    Warning,
    Error
}

@singleton
export class ConsoleLogger implements ILogger {

    severityThreshold: SeverityLevel = SeverityLevel.Debug;
    
    private log(message: string, severityLevel: SeverityLevel = SeverityLevel.Info, ...properties: any[]) {
        if(severityLevel >= this.severityThreshold) {
            console.log(message, ...properties);            
        }
    }
    
    debug(message: string, ...properties: any[]) { this.log(message, SeverityLevel.Debug, ...properties); }
    info(message: string, ...properties: any[]) { this.log(message, SeverityLevel.Info, ...properties); }
    warn(message: string, ...properties: any[]) { this.log(message, SeverityLevel.Warning, ...properties); }
    error(message: string, ...properties: any[]) { this.log(message, SeverityLevel.Error, ...properties); }
}