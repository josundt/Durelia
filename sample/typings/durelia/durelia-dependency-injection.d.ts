declare module "durelia-dependency-injection" {
    export type IInjectable = IResolvableConstructor | {};
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
    export function inject(...args: Array<IInjectable>): (classType: Function) => void;
    export function singleton(classType: Function): void;
    export function transient(classType: Function): void;
    export class Lazy<T extends IInjectable> {
        private _injectable;
        static of<T>(injectable: IInjectable): Lazy<T>;
        resolver: IResolvedInstance;
    }
    
}