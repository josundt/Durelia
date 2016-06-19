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

interface IRouteHrefBindingArgs {
    route: string | KnockoutObservable<string>;
    params?: any;
    options?: INavigationOptions;
}

@singleton
export class NavigationController {
    /** @internal */
    private static routeExpandRegex: RegExp = /\:([^\:\/\(\)\?\=\&]+)/g;
 
    /** @internal */
    private static getBestMatchedRoute(args: IRouteActivationModel, ...routes: string[]): string {
        let bestMatchInfo = { route: null as string, paramsMatches: -1 };

        let argKeys = Object.keys(args).sort();
        routes.forEach((r, idx) => {
            let paramKeys = this.getRouteParams(r, true);
            let matchInfo = { route: r, paramsMatches: 0 };
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
 
    /** @internal */
    private static getRoute(name: string, args: IRouteActivationModel): string {
        let foundRouteConfigs = durandalRouter.routes.filter(r => r["name"] === name);

        let routes: string[] = [];
        if (foundRouteConfigs.length < 1) {
            throw new Error(`NavigationController: No route named "${name}" was found.`);
        }
        else if (foundRouteConfigs.length > 1) {
            for (let routeConfig of foundRouteConfigs) {
                let rOrRs = routeConfig.route;
                if (typeof rOrRs === "string") {
                    routes.push(rOrRs);
                } else {
                    routes.concat(rOrRs);
                }
            }
        } else {
            let rOrRs = foundRouteConfigs[0].route;
            if (typeof rOrRs === "string") {
                routes.push(rOrRs);
            } else {
                routes.concat(rOrRs);
            }
        }

        let route: string = this.getBestMatchedRoute(args, ...routes);
            
        return route;
    }
    
    /** @internal */
    private static getRouteParams(route: string, sort?: boolean): string[] {
        let match: RegExpExecArray;
        let count = 0;
        let routeParams: string[] = [];
        while (match = NavigationController.routeExpandRegex.exec(route)) {
            routeParams.push(match[1]);
        }
        if (sort) {
           routeParams.sort(); 
        }
        return routeParams;
    }

    /** @internal */
    private static getFragment(route: string, args: IRouteActivationModel): string {
        let url = route.replace(/\(|\)/g, ""); 
        let queryStringParams: IRouteActivationModel = {};
        Object.keys(args).forEach(k => queryStringParams[k] = args[k]);

        url = url.replace(NavigationController.routeExpandRegex, (substring, group1) => {
            let replacement;
            if (Object.keys(args).indexOf(group1) >= 0) {
                delete queryStringParams[group1];
                replacement = NavigationController.urlSerialize(args[group1]);
            }
            return replacement;
        });
        if (Object.keys(queryStringParams).length) {
            let queryStringParts = Object.keys(queryStringParams).map(k => {
                let key = NavigationController.urlSerialize(k);
                let value = NavigationController.urlSerialize(queryStringParams[k]);
                return `${key}=${value}`;
            });
            url = `${url}?${queryStringParts.join("&")}`;
        }
        
        return url;
    }
    
    /** @internal */
    private static isoDateStringRegex: RegExp = /^\d{4}\-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?([\+\-]\d{2}:\d{2}|[A-Z])$/i;

    /** @internal */
    private static urlSerialize(value: any): string {
        let result: string;
        if (value instanceof Date) {
            result = (<Date>value).toISOString();
        } else {
            result = String(value);
        }
        return encodeURIComponent(result);
    }
    
    /** @internal */
    private static urlDeserialize(text: string): any {
        let intValue: number;
        let floatValue: number;
        
        text = decodeURIComponent(text);
        
        if (text === "false") {
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

    /** @internal */
    private static registerRouteHrefBindingHandler() {
        
        function onRouteHrefLinkClick(evt: MouseEvent) {
            let elem = evt.currentTarget as HTMLAnchorElement; 
            let fragment = elem.getAttribute("data-route-href-fragment");
            let strReplace = elem.getAttribute("data-route-href-replace"); 
            let replace = strReplace === "true";
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
                let bindingArgs: IRouteHrefBindingArgs = bindingArgsAccessor();
                let routeName = bindingArgs && bindingArgs.route ? ko.utils.unwrapObservable<string>(bindingArgs.route) : undefined;
                if (!routeName || typeof routeName !== "string") {
                    throw new Error("knockout binding error: 'routeHref' - invalid args: name property required.");
                }
                let routeArgs: IRouteActivationModel = bindingArgs.params || {};
                let navOptions: INavigationOptions = bindingArgs.options;
                let route = NavigationController.getRoute(routeName, routeArgs);
                let fragment = NavigationController.getFragment(route, routeArgs);
                let url = durandalHistory["root"] + durandalHistory.getFragment(fragment || "", false);
                element.setAttribute("data-route-href-fragment", fragment);
                element.setAttribute("data-route-href-replace", (navOptions && navOptions.replace) ? "true" : "false");
                element.href = url;
            }
        };
    }

    /** @internal */
    private static routerModelActivationEnabled: boolean = false;
    
    /** @internal */
    static enableRouterModelActivation(): void {

        // Used by Durelia FrameworkConfiguration

        if (NavigationController.routerModelActivationEnabled) {
            return;
        }

        this.registerRouteHrefBindingHandler();
        
        durandalRouter.on("router:route:activating").then((viewmodel: any, instruction: DurandalRouteInstruction, router: DurandalRouter) => {
            //let routeParamProperties = instruction.config.routePattern.exec(<string>instruction.config.route).splice(1);
            let routeParamProperties: string[] = [];
            let match: RegExpExecArray;
            while (match = NavigationController.routeExpandRegex.exec(<string>instruction.config.route)) {
                routeParamProperties.push(match[1]);
            }
            
            let routeParamValues = instruction.config.routePattern.exec(instruction.fragment).splice(1);
            let routeParams: { [routeParam: string]: string | number } = undefined;
            if (routeParamProperties.length && routeParamValues.length) {
                if (routeParamProperties.length === routeParamValues.length) {
                    routeParams = routeParams || {};
                    for (let i = 0; i < routeParamProperties.length; i++) {
                        let prop = routeParamProperties[i].replace(/[\(\)\:]/g, "");
                        let value = NavigationController.urlDeserialize(routeParamValues[i]);
                        routeParams[prop] = value;
                    }
                } else {
                    //log warning
                }
            }
            if (instruction.queryParams) {
                routeParams = routeParams || {};
                Object.keys(instruction.queryParams).forEach(key => routeParams[key] = instruction.queryParams[key]);
            }
            instruction.params.splice(0);
            instruction.params.push(routeParams);
            
        });

        NavigationController.routerModelActivationEnabled = true;
    }

    navigateToRoute<TActivationModel>(routeName: string, args?: TActivationModel, options?: INavigationOptions): void {
        let routeArgs: IRouteActivationModel = <any>args || {};
        let route = NavigationController.getRoute(routeName, routeArgs);
        let fragment = NavigationController.getFragment(route, routeArgs);
        durandalRouter.navigate(fragment, { replace: options && options.replace, trigger: true });
    }
    
    navigateBack(): void {
        window.history.back();
    }
}