declare module "durelia-viewmodel" {
    export interface IViewModel<TActivationModel> {
        canActivate?(options?: TActivationModel): Promise<boolean> | boolean;
        activate?(options?: TActivationModel): Promise<any> | any | void;
        canDeactivate?(): Promise<boolean> | boolean;
        deactivate?(): Promise<any> | any | void;
    }
    export interface IDialogViewModel<TActivationModel, TResultOutput> extends IViewModel<TActivationModel> {
    }
    
}