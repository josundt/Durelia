declare module "durelia-framework" {
    import { IDependencyInjectionContainer, IResolvableConstructor, IResolvedInstance } from "durelia-dependency-injection";
    export interface IDurelia {
        use: IFrameworkConfiguration;
        container: IDependencyInjectionContainer;
    }
    /**
     * The Durela Framework configuration
     * @export
     * @interface IFrameworkConfiguration
     */
    export interface IFrameworkConfiguration {
        /**
         * Adds an existing object to the framework's dependency injection container.
         * @param {IResolvableConstructor} type The type (class)
         * @param {IResolvedInstance} instance The instance to register
         * @returns {this} Resturns this (FrameworkConfiguration) to enable chaining.
         * @memberOf FrameworkConfiguration
         */
        instance(type: IResolvableConstructor, instance: IResolvedInstance): this;
        /**
         * Configures Durandal to use ES2015 Promise instead of JQueryDeferred/JQueryPromise.
         * Make Durandal use native Promise instead of JQuery Promise/Deferred, and optionally register Promise polyfill
         * @param {PromiseConstructorLike} promisePolyfill Optional promise implementation to register as global Promise variable
         * @returns {this} Returns this (FrameworkConfiguration) to enable chaining.
         * @memberOf IFrameworkConfiguration
         */
        nativePromise(promisePolyfill?: PromiseConstructorLike): this;
        /**
         * Configures Durandal to use the observable plugin, but only for viewmodel classes decorated with the @observe decorator.
         * @returns {this} Returns this (FrameworkConfiguration) to enable chaining.
         * @memberOf IFrameworkConfiguration
         */
        observeDecorator(): this;
        /**
         * Configures Durandal to support viewmodel modules with multiple exports. If it finds a default export it will use this as the viewmodel class.
         * @returns {this} Returns this (FrameworkConfiguration) to enable chaining.
         * @memberOf IFrameworkConfiguration
         */
        viewModelDefaultExports(): this;
        /**
         * Configures the router to activate viewmodels using a single activation object instead of an array of strings
         * The route /items/:categoryId/:itemId using url /items/1/2 would normally call activate like this: activate("1", "2").
         * With model activation enabled it will call activate like this: activate({ categoryId: 1, itemId: 2 }).
         * @returns {this} Returns this (FrameworkConfiguration) to enable chaining.
         * @memberOf FrameworkConfiguration
         */
        routerModelActivation(): this;
    }
    export class FrameworkConfiguration implements IFrameworkConfiguration {
        nativePromise(promisePolyfill?: PromiseConstructorLike): this;
        viewModelDefaultExports(): this;
        observeDecorator(): this;
        routerModelActivation(): this;
        instance(type: IResolvableConstructor, instance: IResolvedInstance): this;
    }
    /**
     * The main Durelia module
     * @export
     * @class Durelia
     * @implements {IDurelia}
     */
    export class Durelia implements IDurelia {
        container: IDependencyInjectionContainer;
        use: IFrameworkConfiguration;
    }
    export let durelia: IDurelia;
    export { inject, singleton, transient, Lazy } from "durelia-dependency-injection";
    export { observe, computedFrom } from "durelia-binding";
    export { useView } from "durelia-templating";
    
}