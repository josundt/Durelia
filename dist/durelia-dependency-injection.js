define(["require", "exports", "durelia-logger"], function (require, exports, durelia_logger_1) {
    "use strict";
    var lifetimePropName = "__lifetime__";
    var DependencyInjectionContainer = (function () {
        function DependencyInjectionContainer(logger) {
            if (logger === void 0) { logger = new durelia_logger_1.Logger(); }
            this.logger = logger;
            this.singletonTypeRegistry = [];
            this.singletonInstances = [];
            this.debug = true;
        }
        DependencyInjectionContainer.prototype.resolve = function (injectable) {
            return this.resolveRecursive(injectable).instance;
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
            return classType.__lifetime__ && classType.__lifetime__ === "transient";
        };
        DependencyInjectionContainer.prototype.isSingleton = function (classType) {
            return !classType.__lifetime__ || classType.__lifetime__ === "singleton";
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
                var lazy = injectable;
                var depNode = {
                    parent: parent,
                    classType: lazy.constructor,
                    instance: lazy.resolver,
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
        return DependencyInjectionContainer;
    }());
    exports.container = new DependencyInjectionContainer();
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
        function Lazy(classOrObject, cont) {
            this.resolver = function () { return cont.resolve(classOrObject); };
        }
        Lazy.of = function (injectable) {
            return new Lazy(injectable, exports.container);
        };
        return Lazy;
    }());
    exports.Lazy = Lazy;
});
//# sourceMappingURL=durelia-dependency-injection.js.map