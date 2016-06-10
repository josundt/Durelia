import * as durandalRouter from "plugins/router";
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

@singleton
export class NavigationController {
    /** @internal */
    private static routeExpandRegex: RegExp = /\:([^\:\/\(\)\?\=\&]+)/g;
 
    /** @internal */
    private getBestMatchedRoute(args: IRouteActivationModel, ...routes: string[]): string {
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
    private getRoute(name: string, args: IRouteActivationModel): string {
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
    private getRouteParams(route: string, sort?: boolean): string[] {
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
    private getFragment(route: string, args: IRouteActivationModel): string {
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
    
    private static isoDateStringRegex: RegExp = /^\d{4}\-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?([\+\-]\d{2}:\d{2}|[A-Z])$/i;

    private static urlSerialize(value: any): string {
        let result: string;
        if (value instanceof Date) {
            result = (<Date>value).toISOString();
        } else {
            result = String(value);
        }
        return encodeURIComponent(result);
    }
    
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
    private fragmentToUrl(fragment: string): string {
        let activeInstruction = durandalRouter.activeInstruction();
        let activeHash = activeInstruction.config.hash;
        let activeFragment: string = activeInstruction.fragment;
        let appRoot = location.href.substring(0, location.href.lastIndexOf(activeFragment));
        if (activeHash && appRoot.indexOf("#") < 0) {
            appRoot += "#";
        }
        let newUrl = appRoot + fragment;
        return newUrl;
    }
    
    /** @internal */
    private static routerModelActivationEnabled: boolean = false;
    
    /** @internal */
    static enableRouterModelActivation(): void {

        // Used by Durelia FrameworkConfiguration

        if (NavigationController.routerModelActivationEnabled) {
            return;
        }
        
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
        let route = this.getRoute(routeName, routeArgs);
        let fragment = this.getFragment(route, routeArgs);
        let url = this.fragmentToUrl(fragment);
        if (options && options.replace) {
            location.replace(url); 
        } else {
            location.assign(url);
        }
    }
    
    navigateBack(): void {
        window.history.back();
    }
}