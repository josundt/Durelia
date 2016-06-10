declare module "durelia-dependency-injection" {
    export type IInjectable = IResolvableConstructor | {};
    export interface IResolvableInstance {
    }
    export interface IResolvableConstructor {
        new (...injectables: IInjectable[]): IResolvableInstance;
        prototype: IResolvableInstance;
        inject?(): Array<IInjectable>;
    }
    export interface IDependencyInjectionContainer {
        resolve<T>(injectable: IInjectable): T;
        registerInstance(classType: IResolvableConstructor, instance: IResolvableInstance): any;
    }
    export function inject(...args: Array<IInjectable>): (classType: Function) => void;
    export function singleton(classType: Function): void;
    export function transient(classType: Function): void;
    export class Lazy<T extends IInjectable> {
        private _injectable;
        static of<T>(injectable: IInjectable): Lazy<T>;
        resolver: () => IInjectable;
    }
    
}