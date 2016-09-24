export declare type IInjectable = IResolvableConstructor | {};
export interface IResolvedInstance {
}
export interface IResolvableConstructor {
    new (...injectables: IInjectable[]): IResolvedInstance;
    prototype: IResolvedInstance;
    inject?(): Array<IInjectable>;
}
export interface IDependencyInjectionContainer {
    resolve<T>(injectable: IInjectable): T;
    registerInstance(classType: IResolvableConstructor, instance: IResolvedInstance): any;
}
export declare function inject(...args: Array<IInjectable>): (classType: Function) => void;
export declare function singleton(classType: Function): void;
export declare function transient(classType: Function): void;
export declare class Lazy<T extends IInjectable> {
    private _injectable;
    static of<T extends IInjectable>(injectable: T): Lazy<T>;
    readonly resolver: IResolvedInstance;
}
