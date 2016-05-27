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
        let foundRoutes = durandalRouter.routes.filter(r => r["name"] === name);

        if (foundRoutes.length > 1) {
            throw new Error(`NavigationController: More than one route with the name "${name}"`);
        }
        else if (foundRoutes.length < 0) {
            throw new Error(`NavigationController: Route with name "${name}" not found`);
        }

        let routeOrRoutes = foundRoutes[0].route;
        let route: string = typeof routeOrRoutes === "string" 
            ? routeOrRoutes 
            : this.getBestMatchedRoute(args, ...routeOrRoutes);
            
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
                replacement = encodeURIComponent(String(args[group1]));
            }
            return replacement;
        });
        if (Object.keys(queryStringParams).length) {
            let queryStringParts = Object.keys(queryStringParams).map(k => `${k}=${encodeURIComponent(String(queryStringParams[k]))}`);
            url = `${url}?${queryStringParts.join("&")}`;
        }
        
        return url;
    }
    
    /** @internal */
    private fragmentToUrl(fragment: string): string {
        
        let currentFragment: string = durandalRouter.activeInstruction().fragment;
        let newUrl = location.href.substring(0, location.href.lastIndexOf(currentFragment)) + fragment;
        return newUrl;
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