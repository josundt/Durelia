define(["require", "exports", "durandal/system", "durandal/binder", "plugins/observable", "plugins/router", "durelia-dependency-injection", "durelia-logger", "durelia-binding", "durelia-router"], function (require, exports, durandalSystem, durandalBinder, durandalObservable, durandalRouter, durelia_dependency_injection_1, durelia_logger_1, durelia_binding_1, durelia_router_1) {
    "use strict";
    var originalBinderBindingMethod = durandalBinder.binding;
    var originalRouterActivateRouteMethod = durandalRouter["activateRoute"];
    var DureliaBootstrapper = (function () {
        function DureliaBootstrapper(container, logger) {
            this.container = container;
            this.logger = logger;
            this.config = {
                useuseES2015Promise: false,
                useObserveDecorator: false,
                useViewModelDefaultExports: false,
                useRouterModelActivation: false
            };
            this.enableDependencyInjection();
        }
        DureliaBootstrapper.defer = function () {
            var result = {};
            result.promise = new Promise(function (resolve, reject) {
                result.resolve = resolve;
                result.reject = reject;
            });
            return result;
        };
        DureliaBootstrapper.prototype.enableDependencyInjection = function () {
            var _this = this;
            durandalSystem["resolveObject"] = function (module) {
                if (durandalSystem.isFunction(module)) {
                    return _this.container.resolve(module.default);
                }
                else {
                    return module;
                }
            };
        };
        DureliaBootstrapper.prototype.useES2015Promise = function (promisePolyfill) {
            if (this.config.useuseES2015Promise) {
                return;
            }
            this.config.useuseES2015Promise = true;
            var logMsg = "Durelia Boostrapper: Enabling ES2015 Promise for Durandal";
            if (promisePolyfill) {
                logMsg += " using specified polyfill.";
            }
            else {
                logMsg += ", expecting existing browser support or polyfill.";
            }
            this.logger.debug(logMsg);
            if (promisePolyfill) {
                window["Promise"] = promisePolyfill;
            }
            if (!Promise.prototype["fail"]) {
                Promise.prototype["fail"] = Promise.prototype.catch;
            }
            durandalSystem.defer = function (action) {
                var deferred = Promise["defer"] && typeof Promise["defer"] === "function"
                    ? Promise["defer"]()
                    : DureliaBootstrapper.defer();
                if (action) {
                    action.call(deferred, deferred);
                }
                var prom = deferred.promise;
                deferred["promise"] = function () { return prom; };
                return deferred;
            };
            return this;
        };
        DureliaBootstrapper.prototype.useViewModelDefaultExports = function () {
            var _this = this;
            if (this.config.useViewModelDefaultExports) {
                return;
            }
            this.config.useViewModelDefaultExports = true;
            this.logger.debug("Durelia Bootstrapper: Enabling default export for viewmodel modules.");
            durandalSystem["resolveObject"] = function (module) {
                if (module && module.default && durandalSystem.isFunction(module.default)) {
                    var vm = _this.container.resolve(module.default);
                    return vm;
                }
                else if (durandalSystem.isFunction(module)) {
                    return _this.container.resolve(module.default);
                }
                else {
                    return module;
                }
            };
            return this;
        };
        Object.defineProperty(DureliaBootstrapper.prototype, "isObservablePluginInstalled", {
            /** @internal */
            get: function () {
                return durandalBinder.binding.toString().indexOf("convertObject") >= 0;
            },
            enumerable: true,
            configurable: true
        });
        DureliaBootstrapper.prototype.useObserveDecorator = function () {
            if (this.config.useObserveDecorator) {
                return;
            }
            this.config.useObserveDecorator = true;
            if (!this.isObservablePluginInstalled) {
                this.logger.error("Durelia Bootstrapper: Durandal observable plugin is not installed. Cannot enable observe decorator.");
            }
            else {
                this.logger.debug("Durelia Bootstrapper: Enabling observe decorator to use the Durandal observable plugin on a per-viewmodel basis.");
                durandalBinder.binding = function (obj, view, instruction) {
                    var hasObserveDecorator = !!(obj && obj.constructor && obj.constructor[durelia_binding_1.observeDecoratorKeyName]);
                    if (instruction.applyBindings && !instruction["skipConversion"] && hasObserveDecorator) {
                        durandalObservable.convertObject(obj);
                    }
                    originalBinderBindingMethod(obj, view, undefined);
                };
            }
            return this;
        };
        DureliaBootstrapper.prototype.useRouterModelActivation = function () {
            if (this.config.useRouterModelActivation) {
                return;
            }
            this.config.useRouterModelActivation = true;
            this.logger.debug("Durelia Bootstrapper: Enabling router model activation (invoking viewmodel activate methods with a single object literal arg instead of multiple string args).");
            durelia_router_1.NavigationController.enableRouterModelActivation();
            return this;
        };
        return DureliaBootstrapper;
    }());
    exports.dureliaBootstrapper = new DureliaBootstrapper(durelia_dependency_injection_1.container, new durelia_logger_1.Logger());
});
//# sourceMappingURL=durelia-bootstrapper.js.map