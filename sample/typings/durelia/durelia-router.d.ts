declare module "durelia-router" {
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
    export class NavigationController {
        private static isoDateStringRegex;
        private static urlSerialize(value);
        private static urlDeserialize(text);
        navigateToRoute<TActivationModel>(routeName: string, args?: TActivationModel, options?: INavigationOptions): void;
        navigateBack(): void;
    }
    
}