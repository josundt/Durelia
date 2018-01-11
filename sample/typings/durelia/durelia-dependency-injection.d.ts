declare module "durelia-dependency-injection" {
    export type IInjectable = IResolvableConstructor | {};
    export interface IResolvedInstance {
    }
    export interface IResolvableConstructor {
        new (...injectables: IInjectable[]): IResolvedInstance;
        prototype: IResolvedInstance;
        inject?(): IInjectable[];
    }
    export interface IDependencyInjectionContainer {
        resolve<T = any>(injectable: IInjectable): T;
        registerInstance(classType: IResolvableConstructor, instance: IResolvedInstance): void;
    }
    /**
     * Decorates a class to specify constructor injection arguments
     * @export
     * @param {...Array<IInjectable>} args The types to inject
     * @returns {Function} The internal decorator function
     */
    export function inject(...args: IInjectable[]): (classType: Function) => void;
    /**
     * Decorates a class to specify singleton IoC container lifetime
     * @export
     * @param {class} classType The class
     * @returns {void}
     */
    export function singleton(classType: Function): void;
    /**
     * Decorates a class to specify singleton IoC container lifetime
     * @export
     * @param {class} classType The class
     * @returns {void}
     */
    export function transient(classType: Function): void;
    export class Lazy<T extends IInjectable> {
        private _injectable;
        /**
         * Use with the inject decorator to inject lazy factory function instead of instance.
         * @static
         * @template T
         * @param {T} injectable The injectable
         * @returns {Lazy<T>} The lazy instances
         * @memberOf Lazy
         */
        static of<T extends IInjectable>(injectable: T): Lazy<T>;
        readonly resolver: IResolvedInstance;
    }
    
}