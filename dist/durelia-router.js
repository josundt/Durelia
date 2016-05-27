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
            var foundRoutes = durandalRouter.routes.filter(function (r) { return r["name"] === name; });
            if (foundRoutes.length > 1) {
                throw new Error("NavigationController: More than one route with the name \"" + name + "\"");
            }
            else if (foundRoutes.length < 0) {
                throw new Error("NavigationController: Route with name \"" + name + "\" not found");
            }
            var routeOrRoutes = foundRoutes[0].route;
            var route = typeof routeOrRoutes === "string"
                ? routeOrRoutes
                : this.getBestMatchedRoute.apply(this, [args].concat(routeOrRoutes));
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
        NavigationController = __decorate([
            durelia_dependency_injection_1.singleton
        ], NavigationController);
        return NavigationController;
    }());
    exports.NavigationController = NavigationController;
});
//# sourceMappingURL=durelia-router.js.map