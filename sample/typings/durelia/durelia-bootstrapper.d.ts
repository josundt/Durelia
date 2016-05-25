declare module "durelia-bootstrapper" {
    export interface IDureliaBootstrapper {
        /** Configures Durandal to use ES2015 Promise instead of JQueryDeferred/JQueryPromise.
         * @param {PromiseConstructorLike} promisePolyfill. Optional; if specified the object will used by the browser as global Promise polyfill.
         * @returns {this} Returns this instance to enable chaining.
        */
        useES20015Promise(promisePolyfill?: PromiseConstructorLike): this;
        /** Configures Durandal to use the observable plugin, but only for viewmodel classes decorated with the @observe decorator.
         * @returns {this} Returns this instance to enable chaining.
        */
        useObserveDecorator(): this;
        /** Configures Durandal to support viewmodel modules with multiple exports. If it finds a default export it will use this as the viewmodel class.
         * @returns {this} Returns this instance to enable chaining.
        */
        useViewModelDefaultExports(): this;
        /** Configures the router to activate viewmodels using a single activation object instead of an array of strings
         * The route /items/:categoryId/:itemId using url /items/1/2 would normally call activate like this: activate("1", "2").
         * With model activation enabled it will call activate like this: activate({ categoryId: 1, itemId: 2 }).
         * @returns {this} Returns this instance to enable chaining.
        */
        useRouterModelActivation(): this;
    }
    export let dureliaBootstrapper: IDureliaBootstrapper;
    
}