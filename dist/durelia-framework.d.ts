import { IDependencyInjectionContainer, IResolvableConstructor, IResolvedInstance } from "durelia-dependency-injection";
export interface IDurelia {
    use: IFrameworkConfiguration;
    container: IDependencyInjectionContainer;
}
export interface IFrameworkConfiguration {
    /**
     * Adds an existing object to the framework's dependency injection container.
     * @param type The object type of the dependency that the framework will inject.
     * @param instance The existing instance of the dependency that the framework will inject.
     * @return Returns the current FrameworkConfiguration instance.
     */
    instance(type: IResolvableConstructor, instance: IResolvedInstance): this;
    /** Configures Durandal to use ES2015 Promise instead of JQueryDeferred/JQueryPromise.
     * @param {PromiseConstructorLike} promisePolyfill. Optional; if specified the object will used by the browser as global Promise polyfill.
     * @returns {this} Returns this instance to enable chaining.
    */
    nativePromise(promisePolyfill?: PromiseConstructorLike): this;
    /** Configures Durandal to use the observable plugin, but only for viewmodel classes decorated with the @observe decorator.
     * @returns {this} Returns this instance to enable chaining.
    */
    observeDecorator(): this;
    /** Configures Durandal to support viewmodel modules with multiple exports. If it finds a default export it will use this as the viewmodel class.
     * @returns {this} Returns this instance to enable chaining.
    */
    viewModelDefaultExports(): this;
    /** Configures the router to activate viewmodels using a single activation object instead of an array of strings
     * The route /items/:categoryId/:itemId using url /items/1/2 would normally call activate like this: activate("1", "2").
     * With model activation enabled it will call activate like this: activate({ categoryId: 1, itemId: 2 }).
     * @returns {this} Returns this instance to enable chaining.
    */
    routerModelActivation(): this;
}
export declare class FrameworkConfiguration implements IFrameworkConfiguration {
    nativePromise(promisePolyfill?: PromiseConstructorLike): this;
    viewModelDefaultExports(): this;
    observeDecorator(): this;
    routerModelActivation(): this;
    instance(type: IResolvableConstructor, instance: IResolvedInstance): this;
}
export declare class Durelia implements IDurelia {
    container: IDependencyInjectionContainer;
    use: IFrameworkConfiguration;
}
export declare let durelia: IDurelia;
export { inject, singleton, transient, Lazy } from "durelia-dependency-injection";
export { observe, computedFrom } from "durelia-binding";
export { useView } from "durelia-templating";
