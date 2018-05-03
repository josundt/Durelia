import * as durandalSystem from "durandal/system";
import * as durandalBinder from "durandal/binder";
import * as durandalObservable from "plugins/observable";
import { inject, singleton, IDependencyInjectionContainer, DependencyInjectionContainer, IResolvableConstructor, IResolvedInstance } from "durelia-dependency-injection";
import { ILogger, Logger } from "durelia-logger";
import { observeDecoratorKeyName } from "durelia-binding";
import { NavigationController } from "durelia-router";

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
     * @param {boolean} force Optional. If true, the polyfill library will be used even when the browser supports Promise natively.
     * @returns {this} Returns this (FrameworkConfiguration) to enable chaining.
     * @memberOf IFrameworkConfiguration
     */
    nativePromise(promisePolyfill?: PromiseConstructorLike, force?: boolean): this;

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

/**
 * Interface for the Durelia configuration state
 * @internal
 * @export
 * @interface IDureliaConfiguration
 */
export interface IDureliaConfiguration {
    usesES2015Promise: boolean;
    usesObserveDecorator: boolean;
    usesViewModelDefaultExports: boolean;
    usesRouterModelActivation: boolean;
}

/**
 * Deferred interface
 * @internal
 * @interface Deferred
 * @template T
 */
interface Deferred<T> {
    promise: Promise<T>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param {*} reason The reason the promise was rejected
     * @returns {Promise<void>} A new rejected Promise
     * @memberOf Deferred
     */
    reject(reason: any): Promise<void>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @template T
     * @param {*} reason The reason the promise was rejected.
     * @returns {Promise<T>} A new rejected Promise.
     * @memberOf Deferred
     */
    reject(reason: any): Promise<T>;

    /**
     * Creates a new resolved promise for the provided value.
     * @template T
     * @param {(T|Promise<T>)} value A promise.
     * @returns {Promise<T>} A promise whose internal state matches the provided promise.
     * @memberOf Deferred
     */
    resolve(value: T | PromiseLike<T>): Promise<T>;

    /**
     * Creates a new resolved promise .
     * @returns {Promise<void>} A resolved promise.
     * @memberOf Deferred
     */
    resolve(): Promise<void>;
}

const originalBinderBindingMethod = durandalBinder.binding;

@singleton
@inject(DependencyInjectionContainer, Logger)
export class FrameworkConfiguration implements IFrameworkConfiguration {

    /**
     * Creates an instance of FrameworkConfiguration.
     * @internal
     * @constructor
     * @param {IDependencyInjectionContainer} container The IoC container
     * @param {ILogger} logger The logger
     * @memberOf FrameworkConfiguration
     */
    constructor(
        container: IDependencyInjectionContainer,
        logger: ILogger
    ) {
        this.container = container;

        this.logger = logger;

        this.config = {
            usesES2015Promise: false,
            usesObserveDecorator: false,
            usesViewModelDefaultExports: false,
            usesRouterModelActivation: false
        };

        this.enableDependencyInjection();
    }

    /** @internal */
    private readonly container: IDependencyInjectionContainer;
    /** @internal */
    private readonly logger: ILogger;
    /** @internal */
    private readonly config: IDureliaConfiguration;

    nativePromise(promisePolyfill?: PromiseConstructorLike, force?: boolean): this {

        if (this.config.usesES2015Promise) {
            return this;
        }
        this.config.usesES2015Promise = true;

        let logMsg = "Durelia Boostrapper: Enabling ES2015 Promise for Durandal";
        if (promisePolyfill) {
            logMsg += " using specified polyfill.";
        } else {
            logMsg += ", expecting existing browser support or polyfill.";
        }
        this.logger.debug(logMsg);

        if (promisePolyfill) {
            (<any>window).Promise = force ? (promisePolyfill) : ((<any>window).Promise || promisePolyfill);
        }

        if (!Promise.prototype["fail"]) {
            Promise.prototype["fail"] = Promise.prototype.catch;
        }

        /* tslint:disable:no-function-expression */
        (<any>durandalSystem).defer = function<T> (this: any, action?: Function): Deferred<any> {

            const deferred: Deferred<T> =
                FrameworkConfiguration.defer();
                // Promise["defer"] && typeof Promise["defer"] === "function"
                //     ? Promise["defer"]()
                //     : FrameworkConfiguration.defer();

            if (action) { action.call(deferred, deferred); }
            const prom = deferred.promise;
            (<any>deferred)["promise"] = () => prom;
            return deferred;

        };
        /* tslint:enable:no-function-expression */

        return this;
    }

    viewModelDefaultExports(): this {

        if (this.config.usesViewModelDefaultExports) {
            return this;
        }
        this.config.usesViewModelDefaultExports = true;

        this.logger.debug("Durelia: Enabling default export for viewmodel modules.");

        this.overrideDurandalResolveObject();

        return this;
    }

    observeDecorator(): this {
        if (this.config.usesObserveDecorator) {
            return this;
        }
        this.config.usesObserveDecorator = true;

        if (!this.isObservablePluginInstalled) {
            this.logger.error("Durelia: Durandal observable plugin is not installed. Cannot enable observe decorator.");
        } else {
            this.logger.debug("Durelia: Enabling observe decorator to use the Durandal observable plugin on a per-viewmodel basis.");

            // tslint:disable-next-line:only-arrow-functions
            (<any>durandalBinder).binding = function (obj: any, view: any, instruction: any): void {

                const hasObserveDecorator = !!(obj && obj.constructor && obj.constructor[observeDecoratorKeyName]);

                if (instruction.applyBindings && !instruction["skipConversion"] && hasObserveDecorator) {
                    durandalObservable.convertObject(obj);
                }

                originalBinderBindingMethod(obj, view, undefined!);
            };

            // durandalObservable["logConversion"] = options.logConversion;
            // if (options.changeDetection) {
            //     changeDetectionMethod = options.changeDetection;
            // }

            // skipPromises = options.skipPromises;
            // shouldIgnorePropertyName = options.shouldIgnorePropertyName || defaultShouldIgnorePropertyName;

        }
        return this;
    }

    routerModelActivation(): this {
        if (this.config.usesRouterModelActivation) {
            return this;
        }
        this.config.usesRouterModelActivation = true;

        this.logger.debug("Durelia: Enabling router model activation (invoking viewmodel activate methods with a single object literal arg instead of multiple string args).");

        NavigationController.enableRouterModelActivation();

        return this;
    }

    instance(type: IResolvableConstructor, instance: IResolvedInstance): this {
        this.container.registerInstance(type, instance);
        return this;
    }

    
    /**
     * Generic resolve object override
     * @internal
     * @private
     * @returns {void}
     * @memberOf FrameworkConfiguration
     */
    private overrideDurandalResolveObject(): void {        
        (<any>durandalSystem)["resolveObject"] = module => {
            if (module && module.default && durandalSystem.isFunction(module.default)) {
                let vm = this.container.resolve(module.default);
                durandalSystem.setModuleId(vm, module.__moduleId__);
                return vm;
            } else if (durandalSystem.isFunction(module)) {
                return this.container.resolve(module);
            } else {
                return module;
            }
        };
    }

    /**
     * Enables dependency injection
     * @internal
     * @private
     * @returns {void}
     * @memberOf FrameworkConfiguration
     */
    private enableDependencyInjection(): void {
        this.overrideDurandalResolveObject();
    }

    /**
     * Creates a deferred
     * @internal
     * @private
     * @static
     * @template T
     * @returns {Deferred<T>} Deferred of T
     */
    private static defer<T>(): Deferred<T> {
        const result = <Deferred<T>>{};

        // tslint:disable-next-line:promise-must-complete
        result.promise = new Promise((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {
            result.resolve = <any>resolve;
            result.reject = <any>reject;
        });
        return result;
    }

    /**
     * Checks whether observable plugin is installed
     * @internal
     * @private
     */
    private get isObservablePluginInstalled(): boolean {
        return durandalBinder.binding.toString().indexOf("convertObject") >= 0;
    }
}

/**
 * The main Durelia module
 * @export
 * @class Durelia
 * @implements {IDurelia}
 */
@singleton
@inject(DependencyInjectionContainer, FrameworkConfiguration)
export class Durelia implements IDurelia {

    /**
     * Creates an instance of Durelia.
     * @internal
     * @param {IDependencyInjectionContainer} container The container
     * @param {IFrameworkConfiguration} frameworkConfig The framework configuration
     * @returns {Duralia} An instance of Duralia
     * @memberof Durelia
     */
    constructor(
        container: IDependencyInjectionContainer,
        frameworkConfig: IFrameworkConfiguration
    ) {
        this.container = container;
        this.use = frameworkConfig;
    }
    container: IDependencyInjectionContainer;
    use: IFrameworkConfiguration;
}

const cont = new DependencyInjectionContainer();
cont.registerInstance(DependencyInjectionContainer as IResolvableConstructor, cont);
export let durelia: IDurelia = cont.resolve<IDurelia>(Durelia);

export {inject, singleton, transient, Lazy} from "durelia-dependency-injection";
export {observe, computedFrom} from "durelia-binding";
export {useView} from "durelia-templating";
