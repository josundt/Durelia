define(["require", "exports", "durandal/system", "durandal/binder", "plugins/observable", "plugins/router", "durelia-dependency-injection", "durelia-logger", "durelia-binding"], function (require, exports, durandalSystem, durandalBinder, durandalObservable, durandalRouter, durelia_dependency_injection_1, durelia_logger_1, durelia_binding_1) {
    "use strict";
    var originalBinderBindingMethod = durandalBinder.binding;
    var originalRouterActivateRouteMethod = durandalRouter["activateRoute"];
    var DureliaBootstrapper = (function () {
        function DureliaBootstrapper(container, logger) {
            this.container = container;
            this.logger = logger;
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
        DureliaBootstrapper.prototype.useES20015Promise = function (promisePolyfill) {
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
            get: function () {
                return durandalBinder.binding.toString().indexOf("convertObject") >= 0;
            },
            enumerable: true,
            configurable: true
        });
        DureliaBootstrapper.prototype.useObserveDecorator = function () {
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
            this.logger.debug("Durelia Bootstrapper: Enabling router model activation (invoking viewmodel activate methods with a single object literal arg instead of multiple string args).");
            var test = durandalRouter;
            durandalRouter.on("router:route:activating").then(function (viewmodel, instruction, router) {
                var routeParamProperties = instruction.config.routePattern.exec(instruction.config.route).splice(1);
                var routeParamValues = instruction.config.routePattern.exec(instruction.fragment).splice(1);
                var routeParams = undefined;
                if (routeParamProperties.length && routeParamValues.length) {
                    if (routeParamProperties.length === routeParamValues.length) {
                        routeParams = {};
                        for (var i = 0; i < routeParamProperties.length; i++) {
                            var prop = routeParamProperties[i].replace(/[\(\)\:]/, "");
                            var numValue = parseInt(routeParamValues[i], 10);
                            var value = isNaN(numValue)
                                ? routeParamValues[i]
                                : numValue;
                            routeParams[prop] = value;
                        }
                    }
                    else {
                    }
                }
                instruction.params.splice(0);
                instruction.params.push(routeParams);
            });
            return this;
        };
        return DureliaBootstrapper;
    }());
    exports.dureliaBootstrapper = new DureliaBootstrapper(durelia_dependency_injection_1.container, new durelia_logger_1.Logger());
});
//# sourceMappingURL=durelia-bootstrapper.js.map