import * as durandalSystem from "durandal/system";
import * as durandalApp from "durandal/app";
import * as durandalBinder from "durandal/binder";
import * as durandalObservable from "plugins/observable";
import * as durandalRouter from "plugins/router";
import {IDependencyInjectionContainer, container} from "durelia-dependency-injection";
import {ILogger, Logger} from "durelia-logger";
import {observeDecoratorKeyName} from "durelia-binding";

interface Deferred<T> {
    promise: Promise<T>;
    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject(reason: any): Promise<void>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T>(reason: any): Promise<T>;

    /**
      * Creates a new resolved promise for the provided value.
      * @param value A promise.
      * @returns A promise whose internal state matches the provided promise.
      */
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;

    /**
     * Creates a new resolved promise .
     * @returns A resolved promise.
     */
    resolve(): Promise<void>;
}

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

let originalBinderBindingMethod = durandalBinder.binding;
let originalRouterActivateRouteMethod = durandalRouter["activateRoute"];

class DureliaBootstrapper {
    constructor(
        public container: IDependencyInjectionContainer,
        private logger: ILogger
    ) {
        this.enableDependencyInjection();
    }
    
    private static defer<T>(): Deferred<T> {
        let result = <Deferred<T>>{};
        result.promise = new Promise(function (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
            result.resolve = <any>resolve;
            result.reject = <any>reject;
        });
        return result;
    }

    private enableDependencyInjection() {
        durandalSystem["resolveObject"] = (module) => {
            if (durandalSystem.isFunction(module)) {
                return this.container.resolve(module.default);
            } else {
                return module;
            }
        };
    }

    useES20015Promise(promisePolyfill?: PromiseConstructorLike): this {
        
        let logMsg = "Durelia Boostrapper: Enabling ES2015 Promise for Durandal";
        if (promisePolyfill) {
            logMsg += ` using specified polyfill.`;
        } else {
            logMsg += ", expecting existing browser support or polyfill.";
        }
        this.logger.debug(logMsg);
        
        if (promisePolyfill) {
            window["Promise"] = promisePolyfill;
        }
        
        if (!Promise.prototype["fail"]) {
            Promise.prototype["fail"] = Promise.prototype.catch;
        }
        
        durandalSystem.defer = function(action?: Function) {

            let deferred = Promise["defer"] && typeof Promise["defer"] === "function"
                ? Promise["defer"]()
                : DureliaBootstrapper.defer();

            if (action) { action.call(deferred, deferred); }
            let prom = deferred.promise;
            deferred["promise"] = () => prom;
            return deferred;

        };
        
        return this;
    }
    
    useViewModelDefaultExports(): this {
        
        this.logger.debug("Durelia Bootstrapper: Enabling default export for viewmodel modules.");
        
        durandalSystem["resolveObject"] = (module) => {
            if (module && module.default && durandalSystem.isFunction(module.default)) {
                let vm = this.container.resolve(module.default);
                return vm;
            } else if (durandalSystem.isFunction(module)) {
                return this.container.resolve(module.default);
            } else {
                return module;
            }
        };
        
        return this;
    }
    
    get isObservablePluginInstalled() {
        return durandalBinder.binding.toString().indexOf("convertObject") >= 0;
    }
        
    useObserveDecorator(): this {
        if (!this.isObservablePluginInstalled) {
            this.logger.error("Durelia Bootstrapper: Durandal observable plugin is not installed. Cannot enable observe decorator.");
        } else {
            this.logger.debug("Durelia Bootstrapper: Enabling observe decorator to use the Durandal observable plugin on a per-viewmodel basis.");
            
            durandalBinder.binding = function(obj, view, instruction) {
                
                let hasObserveDecorator = !!(obj && obj.constructor && obj.constructor[observeDecoratorKeyName]);
                
                if (instruction.applyBindings && !instruction["skipConversion"] && hasObserveDecorator) {
                    durandalObservable.convertObject(obj);
                }

                originalBinderBindingMethod(obj, view, undefined);
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
    
    useRouterModelActivation(): this {
        this.logger.debug("Durelia Bootstrapper: Enabling router model activation (invoking viewmodel activate methods with a single object literal arg instead of multiple string args).");
        
        let test = durandalRouter;
        durandalRouter.on("router:route:activating").then((viewmodel: any, instruction: DurandalRouteInstruction, router: DurandalRouter) => {
            let routeParamProperties = instruction.config.routePattern.exec(<string>instruction.config.route).splice(1);
            let routeParamValues = instruction.config.routePattern.exec(instruction.fragment).splice(1);
            let routeParams: { [routeParam: string]: string | number } = undefined;
            if (routeParamProperties.length && routeParamValues.length) {
                if (routeParamProperties.length === routeParamValues.length) {
                    routeParams = {};
                    for (let i = 0; i < routeParamProperties.length; i++) {
                        let prop = routeParamProperties[i].replace(/[\(\)\:]/, "");
                        let numValue = parseInt(routeParamValues[i], 10);
                        let value: string | number = isNaN(numValue)
                            ? routeParamValues[i]
                            : numValue;
                        
                        routeParams[prop] = value;
                    }
                } else {
                    //log warning
                }
            }
            instruction.params.splice(0);
            instruction.params.push(routeParams);
            
        });
        return this;
    }
    
}

export let dureliaBootstrapper: IDureliaBootstrapper = new DureliaBootstrapper(container, new Logger());