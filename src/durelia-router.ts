import * as durandalRouter from "plugins/router";
import * as durandalHistory from "plugins/history";
import * as ko from "knockout";

import {singleton} from "durelia-dependency-injection";

export interface IRouteActivationModel {
    [name: string]: string | number;
}

export interface INavigationOptions {
    replace: boolean;
}

export interface INavigationController {
    navigateToRoute<TActivationModel>(routeName: string, args?: TActivationModel, options?: INavigationOptions): void;
    navigateBack(): void;
}

interface IOptionalRouteParamInfo {
    name: string;
    hasValue: boolean;
}

interface IRouteHrefBindingArgs {
    route: string | KnockoutObservable<string>;
    params?: any;
    options?: INavigationOptions;
}

@singleton
export class NavigationController {

    /** @internal */
    private static readonly routeExpandRegex: RegExp = /\:([^\:\/\(\)\?\=\&]+)/g;
    /** @internal */
    private static readonly optionalParamFragmentRegExp: RegExp = /(\([^\)]+\))/g;
     /** @internal */
    private static readonly isoDateStringRegex: RegExp = /^\d{4}\-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?([\+\-]\d{2}:\d{2}|[A-Z])$/i;
    /** @internal */
    private static routerModelActivationEnabled: boolean = false;

    navigateToRoute<TActivationModel>(routeName: string, args?: TActivationModel, options?: INavigationOptions): void {
        const routeArgs: IRouteActivationModel = <any>args || {};
        const route = NavigationController.getRoute(routeName, routeArgs);
        if (route === undefined) {
            throw new Error(`Unable to navigate: Route "${routeName}" was not found`);
        }
        const fragment = NavigationController.getFragment(route, routeArgs);
        durandalRouter.navigate(fragment, { replace: !!(options && options.replace), trigger: true });
    }
    
    navigateBack(): void {
        window.history.back();
    }

    /**
     * Enables router model activation 
     * @internal
     * @static
     * @returns {void}
     * @memberOf NavigationController
     */
    static enableRouterModelActivation(): void {

        // Used by Durelia FrameworkConfiguration

        if (NavigationController.routerModelActivationEnabled) {
            return;
        }

        this.registerRouteHrefBindingHandler();
        
        durandalRouter.on("router:route:activating").then((viewmodel: any, instruction: DurandalRouteInstruction, router: DurandalRouter) => {
            //const routeParamProperties = instruction.config.routePattern.exec(<string>instruction.config.route).splice(1);
            const routeParamProperties: string[] = [];
            let match: RegExpExecArray | null;
            /* tslint:disable:no-conditional-assignment */
            while (match = NavigationController.routeExpandRegex.exec(<string>instruction.config.route)) {
                routeParamProperties.push(match[1]);
            }
            /* tslint:enable:no-conditional-assignment */
            
            const routeParamMatches = instruction.config.routePattern ? instruction.config.routePattern.exec(instruction.fragment) : null;
            const routeParamValues = routeParamMatches ? routeParamMatches.splice(1) : [];
            let routeParams: { [routeParam: string]: string | number } | undefined = undefined;
            if (routeParamProperties.length && routeParamValues.length) {
                if (routeParamProperties.length === routeParamValues.length) {
                    routeParams = routeParams || {};
                    for (let i = 0; i < routeParamProperties.length; i++) {
                        const prop = routeParamProperties[i].replace(/[\(\)\:]/g, "");
                        const value = NavigationController.urlDeserialize(routeParamValues[i]);
                        routeParams[prop] = value;
                    }
                } else {
                    //log warning
                }
            }
            if (instruction.queryParams) {
                routeParams = routeParams || {};
                Object.keys(instruction.queryParams).forEach(key => routeParams![key] = instruction.queryParams[key]);
            }
            instruction.params.splice(0);
            instruction.params.push(routeParams);
            
        });

        NavigationController.routerModelActivationEnabled = true;
    }

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
    private static getBestMatchedRoute(args: IRouteActivationModel, ...routes: string[]): string | undefined {
        let bestMatchInfo = { route: <string | undefined>undefined, paramsMatches: -1 };

        const argKeys = Object.keys(args).sort();
        routes.forEach((r, idx) => {
            const paramKeys = this.getRouteParams(r, true);
            const matchInfo = { route: r, paramsMatches: 0 };
            paramKeys.forEach(p => {
                if (argKeys.indexOf(p)) {
                    matchInfo.paramsMatches++;
                }
            });
            if (matchInfo.paramsMatches > bestMatchInfo.paramsMatches) {
                bestMatchInfo = matchInfo;
            }
        });
        return bestMatchInfo.route;
    }
 
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
    private static getRoute(name: string, args: IRouteActivationModel): string  | undefined {
        const foundRouteConfigs = durandalRouter.routes.filter(r => r["name"] === name);

        const routes: string[] = [];
        if (foundRouteConfigs.length < 1) {
            throw new Error(`NavigationController: No route named "${name}" was found.`);
        }
        else if (foundRouteConfigs.length > 1) {
            for (const routeConfig of foundRouteConfigs) {
                const rOrRs = routeConfig.route;
                if (typeof rOrRs === "string") {
                    routes.push(rOrRs);
                } else if (rOrRs instanceof Array) {
                    routes.concat(rOrRs);
                }
            }
        } else {
            const rOrRs = foundRouteConfigs[0].route;
            if (typeof rOrRs === "string") {
                routes.push(rOrRs);
            } else if (rOrRs instanceof Array) {
                routes.concat(rOrRs);
            }
        }

        const route: string | undefined = this.getBestMatchedRoute(args, ...routes);
            
        return route;
    }
    
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
    private static getRouteParams(route: string, sort?: boolean): string[] {
        let match: RegExpExecArray | null;
        const routeParams: string[] = [];

        /* tslint:disable:no-conditional-assignment */
        while (match = NavigationController.routeExpandRegex.exec(route)) {
            routeParams.push(match[1]);
        }
        /* tslint:enable:no-conditional-assignment */
        
        if (sort) {
           routeParams.sort(); 
        }
        return routeParams;
    }

    /**
     * Gets the optional route parameters from a route
     * @internal
     * @private
     * @static
     * @param {string} route The route
     * @returns {Array<IOptionalRouteParamInfo[]>} The optional route parameter info
     * @memberOf NavigationController
     */
    private static getOptionalRouteParamSegments(route: string): Array<IOptionalRouteParamInfo[]> {
        const optionalParamSegments: Array<IOptionalRouteParamInfo[]> = [];

        let optionalParamFragmentMatch: RegExpExecArray | null;
        const optionalParamFragments: string[] = [];
        
        /* tslint:disable:no-conditional-assignment */
        while (optionalParamFragmentMatch = this.optionalParamFragmentRegExp.exec(route)) {
            optionalParamFragments.push(optionalParamFragmentMatch[1]);
        }
        /* tslint:enable:no-conditional-assignment */

        for (const optionalParamFragment of optionalParamFragments) {
            let optionalParamMatch: RegExpExecArray | null;
            const optionalParams: { name: string; hasValue: boolean; }[] = [];

            /* tslint:disable:no-conditional-assignment */
            while (optionalParamMatch = NavigationController.routeExpandRegex.exec(optionalParamFragment)) {
                optionalParams.push({ name: optionalParamMatch[1], hasValue: false });
            }
            /* tslint:enable:no-conditional-assignment */

            optionalParamSegments.push(optionalParams);
        }

        return optionalParamSegments;
    }

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
    private static getFragment(route: string, args: IRouteActivationModel): string {
        const queryStringParams: IRouteActivationModel = {};
        
        // Adding all args into queryString map 
        Object.keys(args).forEach(k => queryStringParams[k] = args[k]);

        // Getting descriptor of optional route param segments
        const optionalParamSegments: Array<IOptionalRouteParamInfo[]> = this.getOptionalRouteParamSegments(route);

        // Merging param values with param placeholders
        let url = route.replace(NavigationController.routeExpandRegex, (substring, group1) => {
            let replacement;
            // If route param was matched 
            if (Object.keys(args).indexOf(group1) >= 0) {
                // Remove from queryString map
                delete queryStringParams[group1];
                // Replace param placeholder with value
                replacement = NavigationController.urlSerialize(args[group1]);
                // Updating descriptor for optional route descriptor if value was matched
                optionalParamSegments.forEach(ops => ops.filter(op => op.name === group1).forEach(op => op.hasValue = true));
            }
            return replacement;
        });

        // Removing optional segments if values were provided for none of the params in the segment
        const optionalParamSegmentIndex = 0;
        url = url.replace(this.optionalParamFragmentRegExp, (substring, group1) => {
            const replacement = optionalParamSegments[optionalParamSegmentIndex].some(ops => ops.hasValue) ? substring : "";
            return replacement;
        });

        // Removing optional segment indicator parenthesises from route  
        url = url.replace(/\(|\)/g, "");

        // Putting arg props not matched with route param placeholders into queryString 
        if (Object.keys(queryStringParams).length) {
            const queryStringParts = Object.keys(queryStringParams).map(k => {
                const key = NavigationController.urlSerialize(k);
                const value = NavigationController.urlSerialize(queryStringParams[k]);
                return `${key}=${value}`;
            });
            url = `${url}?${queryStringParts.join("&")}`;
        }
        
        return url;
    }
    
    /**
     * Serializes simple values for URLs
     * @internal
     * @private
     * @static
     * @param {*} value The value to serialize
     * @returns {string} The serialized value
     * @memberOf NavigationController
     */
    private static urlSerialize(value: any): string {
        let result: string;
        if (value instanceof Date) {
            result = (<Date>value).toISOString();
        } else {
            result = String(value);
        }
        return encodeURIComponent(result);
    }
    
    /**
     * Deerializes simple values from URLs
     * @internal
     * @private
     * @static
     * @param {*} text The string to deserialize
     * @returns {string} The deserialized string
     * @memberOf NavigationController
     */
    private static urlDeserialize(text: string): any {
        let intValue: number;
        let floatValue: number;
        
        text = decodeURIComponent(text);
        
        if (text === "undefined") {
            return undefined;
        }
        else if (text === "null") {
            return null;
        }
        else if (text === "false") {
            return false;
        } else if (text === "true") {
            return true;
        } else if (!isNaN(intValue = parseInt(text, 10))) {
            return intValue;
        } else if (!isNaN(floatValue = parseFloat(text))) {
            return floatValue;
        } else if (NavigationController.isoDateStringRegex.test(text)) {
            return new Date(text);
        } else {
            return text;
        }
    }

    /**
     * Registers the routeHref knockout binding handler
     * @internal
     * @private
     * @static
     * @returns void
     * @memberOf NavigationController
     */
    private static registerRouteHrefBindingHandler(): void {
        
        function onRouteHrefLinkClick(evt: MouseEvent) {
            const elem = evt.currentTarget as HTMLAnchorElement; 
            const fragment = elem.getAttribute("data-route-href-fragment")!;
            const strReplace = elem.getAttribute("data-route-href-replace"); 
            const replace = strReplace === "true";
            evt.preventDefault();
            durandalRouter.navigate(fragment, { replace: replace, trigger: true });
        }
        
        ko.bindingHandlers["route-href"] = ko.bindingHandlers["route-href"] || {
            init(
                element: HTMLAnchorElement,
                bindingArgsAccessor: () => IRouteHrefBindingArgs,
                allBindingsAccessor: KnockoutAllBindingsAccessor,
                viewModel: any,
                bindingContext: KnockoutBindingContext
            ) {
                element.addEventListener("click", onRouteHrefLinkClick);
                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    element.removeEventListener("click", onRouteHrefLinkClick);
                });
            },
            update(
                element: HTMLAnchorElement,
                bindingArgsAccessor: () => IRouteHrefBindingArgs,
                allBindingsAccessor: KnockoutAllBindingsAccessor,
                viewModel: any,
                bindingContext: KnockoutBindingContext
            ) {
                if (element.tagName.toUpperCase() !== "A") {
                    throw new Error("knockout binding error: 'routeHref' can only be used with anchor (A) HTML elements.");
                }
                const bindingArgs: IRouteHrefBindingArgs = bindingArgsAccessor();
                const routeName = bindingArgs && bindingArgs.route ? ko.utils.unwrapObservable<string>(bindingArgs.route) : undefined;
                if (!routeName || typeof routeName !== "string") {
                    throw new Error("knockout binding error: 'routeHref' - invalid args: name property required.");
                }
                const routeArgs: IRouteActivationModel = bindingArgs.params || {};
                const navOptions: INavigationOptions | undefined = bindingArgs.options;
                const route = NavigationController.getRoute(routeName, routeArgs);
                if (route === undefined) {
                    throw new Error(`Unable to navigate: Route "${routeName}" was not found`);
                }
                const fragment = NavigationController.getFragment(route, routeArgs);
                const url = durandalHistory["root"] + durandalHistory.getFragment(fragment || "", false);
                element.setAttribute("data-route-href-fragment", fragment);
                element.setAttribute("data-route-href-replace", (navOptions && navOptions.replace) ? "true" : "false");
                element.href = url;
            }
        };
    }
}