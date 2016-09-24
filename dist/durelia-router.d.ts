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
export declare class NavigationController {
    constructor();
    navigateToRoute<TActivationModel>(routeName: string, args?: TActivationModel, options?: INavigationOptions): void;
    navigateBack(): void;
}
