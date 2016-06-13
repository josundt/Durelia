var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "durelia-logger", "durelia-framework"], function (require, exports, durelia_logger_1, durelia_framework_1) {
    "use strict";
    var lifetimePropName = "__lifetime__";
    /** @internal */
    var DependencyInjectionContainer = (function () {
        function DependencyInjectionContainer(
            /** @internal */
            logger) {
            if (logger === void 0) { logger = new durelia_logger_1.Logger(); }
            this.logger = logger;
            this.singletonTypeRegistry = [];
            this.singletonInstances = [];
            this.debug = true;
        }
        DependencyInjectionContainer.prototype.resolve = function (injectable) {
            return this.resolveRecursive(injectable).instance;
        };
        /** @internal */
        DependencyInjectionContainer.prototype.registerInstance = function (classType, instance) {
            var errMsg = "Cannor register instance:";
            if (!instance) {
                throw new Error(errMsg + " Instance is null or undefined.");
            }
            else if (!classType) {
                throw new Error(errMsg + " Type is is null or undefined.");
            }
            else if (!instance.constructor || !this.isConstructorFunction(instance.constructor)) {
                throw new Error(errMsg + " Instance is not a class instance.");
            }
            else if (!this.isConstructorFunction(classType)) {
                throw new Error(errMsg + " Type is invalid (not a class/constructor function).");
            }
            else if (classType !== instance.constructor) {
                throw new Error(errMsg + " Instance is not of the type specified.");
            }
            else if (this.singletonTypeRegistry.indexOf(classType) >= 0) {
                throw new Error("The type " + classType + " is already a registered singleton.");
            }
            this.singletonTypeRegistry.push(classType);
            this.singletonInstances.push(instance);
        };
        DependencyInjectionContainer.prototype.isConstructorFunction = function (o) {
            return !!(o && typeof o === "function" && o["prototype"]);
        };
        DependencyInjectionContainer.prototype.isObjectInstance = function (o) {
            return typeof o !== "function" && Object(o) === o; //&& Object.getPrototypeOf(o) === Object.prototype;
        };
        DependencyInjectionContainer.prototype.isLazyInjection = function (o) {
            return this.isObjectInstance(o) && o.constructor && this.getClassName(o.constructor) === "Lazy";
        };
        DependencyInjectionContainer.prototype.getClassName = function (classType) {
            return classType.prototype.constructor["name"];
        };
        DependencyInjectionContainer.prototype.hasInjectionInstructions = function (classType) {
            return !!(classType.inject && typeof classType.inject === "function");
        };
        DependencyInjectionContainer.prototype.getInjectees = function (classType) {
            if (this.isConstructorFunction(classType)) {
                if (this.hasInjectionInstructions(classType)) {
                    return classType.inject();
                }
            }
            return [];
        };
        DependencyInjectionContainer.prototype.hasLifetimeDecorator = function (classType) {
            return !!classType.__lifetime__;
        };
        DependencyInjectionContainer.prototype.isTransient = function (classType) {
            return !classType.__lifetime__ || classType.__lifetime__ === "transient";
        };
        DependencyInjectionContainer.prototype.isSingleton = function (classType) {
            return classType.__lifetime__ && classType.__lifetime__ === "singleton";
        };
        DependencyInjectionContainer.prototype.getDependencyPath = function (node) {
            var parts = [];
            while (node) {
                parts.unshift(this.getClassName(node.classType));
                node = node.parent;
            }
            return parts.join("/");
        };
        DependencyInjectionContainer.prototype.resolveRecursive = function (injectable, parent) {
            if (parent === void 0) { parent = null; }
            if (this.isLazyInjection(injectable)) {
                var lazy_1 = injectable;
                var depNode = {
                    parent: parent,
                    classType: lazy_1.constructor,
                    instance: function () { return lazy_1.resolver; },
                    children: []
                };
                return depNode;
            }
            else if (this.isConstructorFunction(injectable)) {
                var classType = injectable;
                var injectees = this.getInjectees(classType);
                var ctorArgsCount = classType.length;
                var className = this.getClassName(classType);
                var depNode = {
                    parent: parent,
                    classType: classType,
                    instance: null,
                    children: []
                };
                var dependencyPath = this.getDependencyPath(depNode);
                if (injectees.length !== ctorArgsCount) {
                    var msg = "Durelia DependencyResolver: " + dependencyPath + " FAILED. Injection argument vs constructor parameters count mismatch.";
                    this.logger.error(msg);
                    throw new Error(msg);
                }
                for (var _i = 0, injectees_1 = injectees; _i < injectees_1.length; _i++) {
                    var injectee = injectees_1[_i];
                    var childDep = this.resolveRecursive(injectee, depNode);
                    depNode.children.push(childDep);
                }
                var ctorInjectionArgs = depNode.children.map(function (c) { return c.instance; });
                if (this.isSingleton(classType)) {
                    var idx = this.singletonTypeRegistry.indexOf(classType);
                    var lifeTimeSpec = this.hasInjectionInstructions(classType) ? "singleton" : "unspecified -> singleton";
                    if (idx >= 0) {
                        depNode.instance = this.singletonInstances[idx];
                        this.logger.debug("Durelia DependencyResolver: " + dependencyPath + " (" + lifeTimeSpec + ") resolved: Returned existing instance.");
                    }
                    else {
                        depNode.instance = new (classType.bind.apply(classType, [void 0].concat(ctorInjectionArgs)))();
                        this.singletonTypeRegistry.push(classType);
                        this.singletonInstances.push(depNode.instance);
                        this.logger.debug("Durelia DependencyResolver: " + dependencyPath + " (" + lifeTimeSpec + ") resolved: Created new instance.");
                    }
                }
                else {
                    depNode.instance = new (classType.bind.apply(classType, [void 0].concat(ctorInjectionArgs)))();
                    var lifeTimeSpec = this.hasInjectionInstructions(classType) ? "transient" : "unspecified -> transient";
                    this.logger.debug("Durelia DependencyResolver: " + dependencyPath + " (" + lifeTimeSpec + ") resolved: Created new instance.");
                }
                return depNode;
            }
            else if (this.isObjectInstance(injectable)) {
                var object = injectable;
                var depNode = {
                    classType: object.constructor ? object.constructor : Object,
                    instance: object,
                    parent: parent,
                    children: []
                };
                var dependencyPath = this.getDependencyPath(depNode);
                this.logger.debug("Durelia DependencyResolver: " + dependencyPath + " resolved. Object instance injected (not a class). Returning instance.", object);
                return depNode;
            }
            else {
                var neitnerClassNorObject = injectable;
                var depNode = {
                    classType: neitnerClassNorObject.constructor ? neitnerClassNorObject.constructor : Object,
                    instance: neitnerClassNorObject,
                    parent: parent,
                    children: []
                };
                var dependencyPath = this.getDependencyPath(depNode);
                var msg = "Durelia DependencyResolver: " + dependencyPath + " FAILED. Not an object or constructor function.";
                this.logger.error(msg, neitnerClassNorObject);
                throw new Error(msg);
            }
        };
        DependencyInjectionContainer = __decorate([
            inject(durelia_logger_1.Logger),
            singleton
        ], DependencyInjectionContainer);
        return DependencyInjectionContainer;
    }());
    exports.DependencyInjectionContainer = DependencyInjectionContainer;
    function inject() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return function (classType) {
            classType["inject"] = function () { return args; };
        };
    }
    exports.inject = inject;
    function singleton(classType) {
        classType.__lifetime__ = "singleton";
    }
    exports.singleton = singleton;
    function transient(classType) {
        classType.__lifetime__ = "transient";
    }
    exports.transient = transient;
    var Lazy = (function () {
        /** @internal */
        function Lazy(_injectable) {
            this._injectable = _injectable;
        }
        Lazy.of = function (injectable) {
            return new Lazy(injectable);
        };
        Object.defineProperty(Lazy.prototype, "resolver", {
            get: function () {
                return durelia_framework_1.durelia.container.resolve(this._injectable);
            },
            enumerable: true,
            configurable: true
        });
        return Lazy;
    }());
    exports.Lazy = Lazy;
});
//# sourceMappingURL=durelia-dependency-injection.js.map