var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "plugins/router", "durelia-dependency-injection"], function (require, exports, durandalRouter, durelia_dependency_injection_1) {
    "use strict";
    var NavigationController = (function () {
        function NavigationController() {
        }
        /** @internal */
        NavigationController.prototype.getBestMatchedRoute = function (args) {
            var _this = this;
            var routes = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                routes[_i - 1] = arguments[_i];
            }
            var bestMatchInfo = { route: null, paramsMatches: -1 };
            var argKeys = Object.keys(args).sort();
            routes.forEach(function (r, idx) {
                var paramKeys = _this.getRouteParams(r, true);
                var matchInfo = { route: r, paramsMatches: 0 };
                paramKeys.forEach(function (p) {
                    if (argKeys.indexOf(p)) {
                        matchInfo.paramsMatches++;
                    }
                });
                if (matchInfo.paramsMatches > bestMatchInfo.paramsMatches) {
                    bestMatchInfo = matchInfo;
                }
            });
            return bestMatchInfo.route;
        };
        /** @internal */
        NavigationController.prototype.getRoute = function (name, args) {
            var foundRouteConfigs = durandalRouter.routes.filter(function (r) { return r["name"] === name; });
            var routes = [];
            if (foundRouteConfigs.length < 1) {
                throw new Error("NavigationController: No route named \"" + name + "\" was found.");
            }
            else if (foundRouteConfigs.length > 1) {
                for (var _i = 0, foundRouteConfigs_1 = foundRouteConfigs; _i < foundRouteConfigs_1.length; _i++) {
                    var routeConfig = foundRouteConfigs_1[_i];
                    var rOrRs = routeConfig.route;
                    if (typeof rOrRs === "string") {
                        routes.push(rOrRs);
                    }
                    else {
                        routes.concat(rOrRs);
                    }
                }
            }
            else {
                var rOrRs = foundRouteConfigs[0].route;
                if (typeof rOrRs === "string") {
                    routes.push(rOrRs);
                }
                else {
                    routes.concat(rOrRs);
                }
            }
            var route = this.getBestMatchedRoute.apply(this, [args].concat(routes));
            return route;
        };
        /** @internal */
        NavigationController.prototype.getRouteParams = function (route, sort) {
            var match;
            var count = 0;
            var routeParams = [];
            while (match = NavigationController.routeExpandRegex.exec(route)) {
                routeParams.push(match[1]);
            }
            if (sort) {
                routeParams.sort();
            }
            return routeParams;
        };
        /** @internal */
        NavigationController.prototype.getFragment = function (route, args) {
            var url = route.replace(/\(|\)/g, "");
            var queryStringParams = {};
            Object.keys(args).forEach(function (k) { return queryStringParams[k] = args[k]; });
            url = url.replace(NavigationController.routeExpandRegex, function (substring, group1) {
                var replacement;
                if (Object.keys(args).indexOf(group1) >= 0) {
                    delete queryStringParams[group1];
                    replacement = NavigationController.urlSerialize(args[group1]);
                }
                return replacement;
            });
            if (Object.keys(queryStringParams).length) {
                var queryStringParts = Object.keys(queryStringParams).map(function (k) {
                    var key = NavigationController.urlSerialize(k);
                    var value = NavigationController.urlSerialize(queryStringParams[k]);
                    return key + "=" + value;
                });
                url = url + "?" + queryStringParts.join("&");
            }
            return url;
        };
        NavigationController.urlSerialize = function (value) {
            var result;
            if (value instanceof Date) {
                result = value.toISOString();
            }
            else {
                result = String(value);
            }
            return encodeURIComponent(result);
        };
        NavigationController.urlDeserialize = function (text) {
            var intValue;
            var floatValue;
            text = decodeURIComponent(text);
            if (text === "false") {
                return false;
            }
            else if (text === "true") {
                return true;
            }
            else if (!isNaN(intValue = parseInt(text, 10))) {
                return intValue;
            }
            else if (!isNaN(floatValue = parseFloat(text))) {
                return floatValue;
            }
            else if (NavigationController.isoDateStringRegex.test(text)) {
                return new Date(text);
            }
            else {
                return text;
            }
        };
        /** @internal */
        NavigationController.prototype.fragmentToUrl = function (fragment) {
            var activeInstruction = durandalRouter.activeInstruction();
            var activeHash = activeInstruction.config.hash;
            var activeFragment = activeInstruction.fragment;
            var appRoot = location.href.substring(0, location.href.lastIndexOf(activeFragment));
            if (activeHash && appRoot.indexOf("#") < 0) {
                appRoot += "#";
            }
            var newUrl = appRoot + fragment;
            return newUrl;
        };
        /** @internal */
        NavigationController.enableRouterModelActivation = function () {
            // Used by DureliaBootstrapper
            if (NavigationController.routerModelActivationEnabled) {
                return;
            }
            durandalRouter.on("router:route:activating").then(function (viewmodel, instruction, router) {
                //let routeParamProperties = instruction.config.routePattern.exec(<string>instruction.config.route).splice(1);
                var routeParamProperties = [];
                var match;
                while (match = NavigationController.routeExpandRegex.exec(instruction.config.route)) {
                    routeParamProperties.push(match[1]);
                }
                var routeParamValues = instruction.config.routePattern.exec(instruction.fragment).splice(1);
                var routeParams = undefined;
                if (routeParamProperties.length && routeParamValues.length) {
                    if (routeParamProperties.length === routeParamValues.length) {
                        routeParams = routeParams || {};
                        for (var i = 0; i < routeParamProperties.length; i++) {
                            var prop = routeParamProperties[i].replace(/[\(\)\:]/g, "");
                            var value = NavigationController.urlDeserialize(routeParamValues[i]);
                            routeParams[prop] = value;
                        }
                    }
                    else {
                    }
                }
                if (instruction.queryParams) {
                    routeParams = routeParams || {};
                    Object.keys(instruction.queryParams).forEach(function (key) { return routeParams[key] = instruction.queryParams[key]; });
                }
                instruction.params.splice(0);
                instruction.params.push(routeParams);
            });
            NavigationController.routerModelActivationEnabled = true;
        };
        NavigationController.prototype.navigateToRoute = function (routeName, args, options) {
            var routeArgs = args || {};
            var route = this.getRoute(routeName, routeArgs);
            var fragment = this.getFragment(route, routeArgs);
            var url = this.fragmentToUrl(fragment);
            if (options && options.replace) {
                location.replace(url);
            }
            else {
                location.assign(url);
            }
        };
        NavigationController.prototype.navigateBack = function () {
            window.history.back();
        };
        /** @internal */
        NavigationController.routeExpandRegex = /\:([^\:\/\(\)\?\=\&]+)/g;
        NavigationController.isoDateStringRegex = /^\d{4}\-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?([\+\-]\d{2}:\d{2}|[A-Z])$/i;
        /** @internal */
        NavigationController.routerModelActivationEnabled = false;
        NavigationController = __decorate([
            durelia_dependency_injection_1.singleton
        ], NavigationController);
        return NavigationController;
    }());
    exports.NavigationController = NavigationController;
});
//# sourceMappingURL=durelia-router.js.map