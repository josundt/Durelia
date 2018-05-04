var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "durandal/system", "durandal/binder", "plugins/observable", "durelia-dependency-injection", "durelia-logger", "durelia-binding", "durelia-router", "durelia-dependency-injection", "durelia-binding", "durelia-templating"], function (require, exports, durandalSystem, durandalBinder, durandalObservable, durelia_dependency_injection_1, durelia_logger_1, durelia_binding_1, durelia_router_1, durelia_dependency_injection_2, durelia_binding_2, durelia_templating_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var originalBinderBindingMethod = durandalBinder.binding;
    var FrameworkConfiguration = /** @class */ (function () {
        /**
         * Creates an instance of FrameworkConfiguration.
         * @internal
         * @constructor
         * @param {IDependencyInjectionContainer} container The IoC container
         * @param {ILogger} logger The logger
         * @memberOf FrameworkConfiguration
         */
        function FrameworkConfiguration(container, logger) {
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
        FrameworkConfiguration_1 = FrameworkConfiguration;
        FrameworkConfiguration.prototype.nativePromise = function (promisePolyfill, force) {
            if (this.config.usesES2015Promise) {
                return this;
            }
            this.config.usesES2015Promise = true;
            var logMsg = "Durelia Boostrapper: Enabling ES2015 Promise for Durandal";
            if (promisePolyfill) {
                logMsg += " using specified polyfill.";
            }
            else {
                logMsg += ", expecting existing browser support or polyfill.";
            }
            this.logger.debug(logMsg);
            if (promisePolyfill) {
                window.Promise = force ? (promisePolyfill) : (window.Promise || promisePolyfill);
            }
            if (!Promise.prototype["fail"]) {
                Promise.prototype["fail"] = Promise.prototype.catch;
            }
            /* tslint:disable:no-function-expression */
            durandalSystem.defer = function (action) {
                var deferred = FrameworkConfiguration_1.defer();
                // Promise["defer"] && typeof Promise["defer"] === "function"
                //     ? Promise["defer"]()
                //     : FrameworkConfiguration.defer();
                if (action) {
                    action.call(deferred, deferred);
                }
                var prom = deferred.promise;
                deferred["promise"] = function () { return prom; };
                return deferred;
            };
            /* tslint:enable:no-function-expression */
            return this;
        };
        FrameworkConfiguration.prototype.viewModelDefaultExports = function () {
            if (this.config.usesViewModelDefaultExports) {
                return this;
            }
            this.config.usesViewModelDefaultExports = true;
            this.logger.debug("Durelia: Enabling default export for viewmodel modules.");
            this.overrideDurandalResolveObject();
            return this;
        };
        FrameworkConfiguration.prototype.observeDecorator = function () {
            if (this.config.usesObserveDecorator) {
                return this;
            }
            this.config.usesObserveDecorator = true;
            if (!this.isObservablePluginInstalled) {
                this.logger.error("Durelia: Durandal observable plugin is not installed. Cannot enable observe decorator.");
            }
            else {
                this.logger.debug("Durelia: Enabling observe decorator to use the Durandal observable plugin on a per-viewmodel basis.");
                // tslint:disable-next-line:only-arrow-functions
                durandalBinder.binding = function (obj, view, instruction) {
                    var hasObserveDecorator = !!(obj && obj.constructor && obj.constructor[durelia_binding_1.observeDecoratorKeyName]);
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
        };
        FrameworkConfiguration.prototype.routerModelActivation = function () {
            if (this.config.usesRouterModelActivation) {
                return this;
            }
            this.config.usesRouterModelActivation = true;
            this.logger.debug("Durelia: Enabling router model activation (invoking viewmodel activate methods with a single object literal arg instead of multiple string args).");
            durelia_router_1.NavigationController.enableRouterModelActivation();
            return this;
        };
        FrameworkConfiguration.prototype.instance = function (type, instance) {
            this.container.registerInstance(type, instance);
            return this;
        };
        /**
         * Generic resolve object override
         * @internal
         * @private
         * @returns {void}
         * @memberOf FrameworkConfiguration
         */
        FrameworkConfiguration.prototype.overrideDurandalResolveObject = function () {
            var _this = this;
            durandalSystem["resolveObject"] = function (module) {
                if (module && module.default && durandalSystem.isFunction(module.default)) {
                    var vm = _this.container.resolve(module.default);
                    durandalSystem.setModuleId(vm, module.__moduleId__);
                    return vm;
                }
                else if (durandalSystem.isFunction(module)) {
                    return _this.container.resolve(module);
                }
                else {
                    return module;
                }
            };
        };
        /**
         * Enables dependency injection
         * @internal
         * @private
         * @returns {void}
         * @memberOf FrameworkConfiguration
         */
        FrameworkConfiguration.prototype.enableDependencyInjection = function () {
            this.overrideDurandalResolveObject();
        };
        /**
         * Creates a deferred
         * @internal
         * @private
         * @static
         * @template T
         * @returns {Deferred<T>} Deferred of T
         */
        FrameworkConfiguration.defer = function () {
            var result = {};
            // tslint:disable-next-line:promise-must-complete
            result.promise = new Promise(function (resolve, reject) {
                result.resolve = resolve;
                result.reject = reject;
            });
            return result;
        };
        Object.defineProperty(FrameworkConfiguration.prototype, "isObservablePluginInstalled", {
            /**
             * Checks whether observable plugin is installed
             * @internal
             * @private
             */
            get: function () {
                return durandalBinder.binding.toString().indexOf("convertObject") >= 0;
            },
            enumerable: true,
            configurable: true
        });
        FrameworkConfiguration = FrameworkConfiguration_1 = __decorate([
            durelia_dependency_injection_1.singleton,
            durelia_dependency_injection_1.inject(durelia_dependency_injection_1.DependencyInjectionContainer, durelia_logger_1.Logger)
        ], FrameworkConfiguration);
        return FrameworkConfiguration;
        var FrameworkConfiguration_1;
    }());
    exports.FrameworkConfiguration = FrameworkConfiguration;
    /**
     * The main Durelia module
     * @export
     * @class Durelia
     * @implements {IDurelia}
     */
    var Durelia = /** @class */ (function () {
        /**
         * Creates an instance of Durelia.
         * @internal
         * @param {IDependencyInjectionContainer} container The container
         * @param {IFrameworkConfiguration} frameworkConfig The framework configuration
         * @returns {Duralia} An instance of Duralia
         * @memberof Durelia
         */
        function Durelia(container, frameworkConfig) {
            this.container = container;
            this.use = frameworkConfig;
        }
        Durelia = __decorate([
            durelia_dependency_injection_1.singleton,
            durelia_dependency_injection_1.inject(durelia_dependency_injection_1.DependencyInjectionContainer, FrameworkConfiguration)
        ], Durelia);
        return Durelia;
    }());
    exports.Durelia = Durelia;
    var cont = new durelia_dependency_injection_1.DependencyInjectionContainer();
    cont.registerInstance(durelia_dependency_injection_1.DependencyInjectionContainer, cont);
    exports.durelia = cont.resolve(Durelia);
    exports.inject = durelia_dependency_injection_2.inject;
    exports.singleton = durelia_dependency_injection_2.singleton;
    exports.transient = durelia_dependency_injection_2.transient;
    exports.Lazy = durelia_dependency_injection_2.Lazy;
    exports.observe = durelia_binding_2.observe;
    exports.computedFrom = durelia_binding_2.computedFrom;
    exports.useView = durelia_templating_1.useView;
});
//# sourceMappingURL=durelia-framework.js.map