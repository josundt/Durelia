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
                    replacement = encodeURIComponent(String(args[group1]));
                }
                return replacement;
            });
            if (Object.keys(queryStringParams).length) {
                var queryStringParts = Object.keys(queryStringParams).map(function (k) { return (k + "=" + encodeURIComponent(String(queryStringParams[k]))); });
                url = url + "?" + queryStringParts.join("&");
            }
            return url;
        };
        /** @internal */
        NavigationController.prototype.fragmentToUrl = function (fragment) {
            var currentFragment = durandalRouter.activeInstruction().fragment;
            var newUrl = location.href.substring(0, location.href.lastIndexOf(currentFragment)) + fragment;
            return newUrl;
        };
        /** @internal */
        NavigationController.enableRouterModelActivation = function () {
            if (NavigationController.routerModelActivationEnabled) {
                return;
            }
            durandalRouter.on("router:route:activating").then(function (viewmodel, instruction, router) {
                var routeParamProperties = instruction.config.routePattern.exec(instruction.config.route).splice(1);
                var routeParamValues = instruction.config.routePattern.exec(instruction.fragment).splice(1);
                var routeParams = undefined;
                if (routeParamProperties.length && routeParamValues.length) {
                    if (routeParamProperties.length === routeParamValues.length) {
                        routeParams = routeParams || {};
                        for (var i = 0; i < routeParamProperties.length; i++) {
                            var prop = routeParamProperties[i].replace(/[\(\)\:]/g, "");
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