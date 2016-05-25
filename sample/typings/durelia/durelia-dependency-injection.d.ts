declare module "durelia-dependency-injection" {
    export type IInjectable = Function | {};
    export interface IDependencyInjectionContainer {
        resolve<T>(injectable: IInjectable): T;
    }
    export let container: IDependencyInjectionContainer;
    export function inject(...args: Array<IInjectable>): (classType: Function) => void;
    export function singleton(classType: Function): void;
    export function transient(classType: Function): void;
    export class Lazy<T extends IInjectable> {
        static of<T>(injectable: IInjectable): Lazy<T>;
    }
    
}