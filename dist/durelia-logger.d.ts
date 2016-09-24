declare module "durelia-logger" {
    export type LogAppender = (message: string, ...properties: any[]) => void;
    export interface ILogger {
        debug: LogAppender;
        info: LogAppender;
        warn: LogAppender;
        error: LogAppender;
    }
    export class Logger implements ILogger {
        constructor();
        debug(message: string, ...properties: any[]): void;
        info(message: string, ...properties: any[]): void;
        warn(message: string, ...properties: any[]): void;
        error(message: string, ...properties: any[]): void;
    }
    
}