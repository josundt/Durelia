var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "plugins/router", "plugins/history", "knockout", "durelia-dependency-injection"], function (require, exports, durandalRouter, durandalHistory, ko, durelia_dependency_injection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NavigationController = /** @class */ (function () {
        function NavigationController() {
        }
        NavigationController_1 = NavigationController;
        NavigationController.prototype.navigateToRoute = function (routeName, args, options) {
            var routeArgs = args || {};
            var route = NavigationController_1.getRoute(routeName, routeArgs);
            if (route === undefined) {
                throw new Error("Unable to navigate: Route \"" + routeName + "\" was not found");
            }
            var fragment = NavigationController_1.getFragment(route, routeArgs);
            durandalRouter.navigate(fragment, { replace: !!(options && options.replace), trigger: true });
        };
        NavigationController.prototype.navigateBack = function () {
            window.history.back();
        };
        /**
         * Enables router model activation
         * @internal
         * @static
         * @returns {void}
         * @memberOf NavigationController
         */
        NavigationController.enableRouterModelActivation = function () {
            // Used by Durelia FrameworkConfiguration
            if (NavigationController_1.routerModelActivationEnabled) {
                return;
            }
            this.registerRouteHrefBindingHandler();
            durandalRouter.on("router:route:activating").then(function (viewmodel, instruction, router) {
                //const routeParamProperties = instruction.config.routePattern.exec(<string>instruction.config.route).splice(1);
                var routeParamProperties = [];
                var match;
                /* tslint:disable:no-conditional-assignment */
                while (match = NavigationController_1.routeExpandRegex.exec(instruction.config.route)) {
                    routeParamProperties.push(match[1]);
                }
                /* tslint:enable:no-conditional-assignment */
                var routeParamMatches = instruction.config.routePattern ? instruction.config.routePattern.exec(instruction.fragment) : null;
                var routeParamValues = routeParamMatches ? routeParamMatches.splice(1) : [];
                var routeParams;
                if (routeParamProperties.length && routeParamValues.length) {
                    if (routeParamProperties.length === routeParamValues.length) {
                        routeParams = routeParams || {};
                        for (var i = 0; i < routeParamProperties.length; i++) {
                            var prop = routeParamProperties[i].replace(/[\(\)\:]/g, "");
                            var value = NavigationController_1.urlDeserialize(routeParamValues[i]);
                            routeParams[prop] = value;
                        }
                    }
                    else {
                        //log warning
                    }
                }
                if (instruction.queryParams) {
                    routeParams = routeParams || {};
                    Object.keys(instruction.queryParams).forEach(function (key) { return routeParams[key] = instruction.queryParams[key]; });
                }
                instruction.params.splice(0);
                instruction.params.push(routeParams);
            });
            NavigationController_1.routerModelActivationEnabled = true;
        };
        /**
         * Gets the best matched route from route activation args
         * @internal
         * @private
         * @static
         * @param {IRouteActivationModel} args The route activation model
         * @param {...string[]} routes The routes
         * @returns {(string | undefined)} The match if found, otherwise undefined
         * @memberOf NavigationController
         */
        NavigationController.getBestMatchedRoute = function (args) {
            var _this = this;
            var routes = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                routes[_i - 1] = arguments[_i];
            }
            var bestMatchInfo = { route: undefined, paramsMatches: -1 };
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
        /**
         * Gets a route by name and route activation model
         * @internal
         * @private
         * @static
         * @param {string} name The route name
         * @param {IRouteActivationModel} args The route activation model
         * @returns {(string  | undefined)} The matched route if found, otherwise undefined
         * @memberOf NavigationController
         */
        NavigationController.getRoute = function (name, args) {
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
                    else if (rOrRs instanceof Array) {
                        routes.concat(rOrRs);
                    }
                }
            }
            else {
                var rOrRs = foundRouteConfigs[0].route;
                if (typeof rOrRs === "string") {
                    routes.push(rOrRs);
                }
                else if (rOrRs instanceof Array) {
                    routes.concat(rOrRs);
                }
            }
            var route = this.getBestMatchedRoute.apply(this, [args].concat(routes));
            return route;
        };
        /**
         * Gets route parameters from route
         * @internal
         * @private
         * @static
         * @param {string} route The route
         * @param {boolean} [sort] Sort or not
         * @returns {string[]} The route params
         * @memberOf NavigationController
         */
        NavigationController.getRouteParams = function (route, sort) {
            var match;
            var routeParams = [];
            /* tslint:disable:no-conditional-assignment */
            while (match = NavigationController_1.routeExpandRegex.exec(route)) {
                routeParams.push(match[1]);
            }
            /* tslint:enable:no-conditional-assignment */
            if (sort) {
                routeParams.sort();
            }
            return routeParams;
        };
        /**
         * Gets the optional route parameters from a route
         * @internal
         * @private
         * @static
         * @param {string} route The route
         * @returns {Array<IOptionalRouteParamInfo[]>} The optional route parameter info
         * @memberOf NavigationController
         */
        NavigationController.getOptionalRouteParamSegments = function (route) {
            var optionalParamSegments = [];
            var optionalParamFragmentMatch;
            var optionalParamFragments = [];
            /* tslint:disable:no-conditional-assignment */
            while (optionalParamFragmentMatch = this.optionalParamFragmentRegExp.exec(route)) {
                optionalParamFragments.push(optionalParamFragmentMatch[1]);
            }
            /* tslint:enable:no-conditional-assignment */
            for (var _i = 0, optionalParamFragments_1 = optionalParamFragments; _i < optionalParamFragments_1.length; _i++) {
                var optionalParamFragment = optionalParamFragments_1[_i];
                var optionalParamMatch = void 0;
                var optionalParams = [];
                /* tslint:disable:no-conditional-assignment */
                while (optionalParamMatch = NavigationController_1.routeExpandRegex.exec(optionalParamFragment)) {
                    optionalParams.push({ name: optionalParamMatch[1], hasValue: false });
                }
                /* tslint:enable:no-conditional-assignment */
                optionalParamSegments.push(optionalParams);
            }
            return optionalParamSegments;
        };
        /**
         * Gets a route fragment from a route by route activation model
         * @internal
         * @private
         * @static
         * @param {string} route The route
         * @param {IRouteActivationModel} args The route activation model
         * @returns {string} The fragment
         * @memberOf NavigationController
         */
        NavigationController.getFragment = function (route, args) {
            var queryStringParams = {};
            // Adding all args into queryString map
            Object.keys(args).forEach(function (k) { return queryStringParams[k] = args[k]; });
            // Getting descriptor of optional route param segments
            var optionalParamSegments = this.getOptionalRouteParamSegments(route);
            // Merging param values with param placeholders
            var url = route.replace(NavigationController_1.routeExpandRegex, function (substring, group1) {
                var replacement;
                // If route param was matched
                if (Object.keys(args).indexOf(group1) >= 0) {
                    // Remove from queryString map
                    delete queryStringParams[group1];
                    // Replace param placeholder with value
                    replacement = NavigationController_1.urlSerialize(args[group1]);
                    // Updating descriptor for optional route descriptor if value was matched
                    optionalParamSegments.forEach(function (ops) { return ops.filter(function (op) { return op.name === group1; }).forEach(function (op) { return op.hasValue = true; }); });
                }
                return replacement;
            });
            // Removing optional segments if values were provided for none of the params in the segment
            var optionalParamSegmentIndex = 0;
            url = url.replace(this.optionalParamFragmentRegExp, function (substring, group1) {
                var replacement = optionalParamSegments[optionalParamSegmentIndex].some(function (ops) { return ops.hasValue; }) ? substring : "";
                return replacement;
            });
            // Removing optional segment indicator parenthesises from route
            url = url.replace(/\(|\)/g, "");
            // Putting arg props not matched with route param placeholders into queryString
            if (Object.keys(queryStringParams).length) {
                var queryStringParts = Object.keys(queryStringParams).map(function (k) {
                    var key = NavigationController_1.urlSerialize(k);
                    var value = NavigationController_1.urlSerialize(queryStringParams[k]);
                    return key + "=" + value;
                });
                url = url + "?" + queryStringParts.join("&");
            }
            return url;
        };
        /**
         * Serializes simple values for URLs
         * @internal
         * @private
         * @static
         * @param {*} value The value to serialize
         * @returns {string} The serialized value
         * @memberOf NavigationController
         */
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
        /**
         * Deerializes simple values from URLs
         * @internal
         * @private
         * @static
         * @param {*} text The string to deserialize
         * @returns {string} The deserialized string
         * @memberOf NavigationController
         */
        NavigationController.urlDeserialize = function (text) {
            var intValue;
            var floatValue;
            text = decodeURIComponent(text);
            if (text === "undefined") {
                return undefined;
            }
            else if (text === "null") {
                return null;
            }
            else if (text === "false") {
                return false;
            }
            else if (text === "true") {
                return true;
                // tslint:disable-next-line:no-conditional-assignment
            }
            else if (!isNaN(intValue = parseInt(text, 10))) {
                return intValue;
                // tslint:disable-next-line:no-conditional-assignment
            }
            else if (!isNaN(floatValue = parseFloat(text))) {
                return floatValue;
            }
            else if (NavigationController_1.isoDateStringRegex.test(text)) {
                return new Date(text);
            }
            else {
                return text;
            }
        };
        /**
         * Registers the routeHref knockout binding handler
         * @internal
         * @private
         * @static
         * @returns {void} Nothing
         * @memberOf NavigationController
         */
        NavigationController.registerRouteHrefBindingHandler = function () {
            function onRouteHrefLinkClick(evt) {
                var elem = evt.currentTarget;
                var fragment = elem.getAttribute("data-route-href-fragment");
                var strReplace = elem.getAttribute("data-route-href-replace");
                var replace = strReplace === "true";
                evt.preventDefault();
                durandalRouter.navigate(fragment, { replace: replace, trigger: true });
            }
            ko.bindingHandlers["route-href"] = ko.bindingHandlers["route-href"] || {
                init: function (element, bindingArgsAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    element.addEventListener("click", onRouteHrefLinkClick);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        element.removeEventListener("click", onRouteHrefLinkClick);
                    });
                },
                update: function (element, bindingArgsAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    if (element.tagName.toUpperCase() !== "A") {
                        throw new Error("knockout binding error: 'routeHref' can only be used with anchor (A) HTML elements.");
                    }
                    var bindingArgs = bindingArgsAccessor();
                    var routeName = bindingArgs && bindingArgs.route ? ko.utils.unwrapObservable(bindingArgs.route) : undefined;
                    if (!routeName || typeof routeName !== "string") {
                        throw new Error("knockout binding error: 'routeHref' - invalid args: name property required.");
                    }
                    var routeArgs = bindingArgs.params || {};
                    var navOptions = bindingArgs.options;
                    var route = NavigationController_1.getRoute(routeName, routeArgs);
                    if (route === undefined) {
                        throw new Error("Unable to navigate: Route \"" + routeName + "\" was not found");
                    }
                    var fragment = NavigationController_1.getFragment(route, routeArgs);
                    var url = durandalHistory["root"] + durandalHistory.getFragment(fragment || "", false);
                    element.setAttribute("data-route-href-fragment", fragment);
                    element.setAttribute("data-route-href-replace", (navOptions && navOptions.replace) ? "true" : "false");
                    element.href = url;
                }
            };
        };
        var NavigationController_1;
        /** @internal */
        NavigationController.routeExpandRegex = /\:([^\:\/\(\)\?\=\&]+)/g;
        /** @internal */
        NavigationController.optionalParamFragmentRegExp = /(\([^\)]+\))/g;
        /** @internal */
        NavigationController.isoDateStringRegex = /^\d{4}\-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?([\+\-]\d{2}:\d{2}|[A-Z])$/i;
        /** @internal */
        NavigationController.routerModelActivationEnabled = false;
        NavigationController = NavigationController_1 = __decorate([
            durelia_dependency_injection_1.singleton
        ], NavigationController);
        return NavigationController;
    }());
    exports.NavigationController = NavigationController;
});
//# sourceMappingURL=durelia-router.js.map