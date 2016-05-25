declare module "durelia-viewmodel" {
    export interface IViewModel<TActivationOptions> {
        canActivate?(options?: TActivationOptions): Promise<boolean>;
        activate?(options?: TActivationOptions): Promise<any>;
        canDeactivate?(): Promise<boolean>;
        deactivate?(): Promise<any>;
    }
    export interface IDialogViewModel<TActivationOptions, TDialogResult> extends IViewModel<TActivationOptions> {
    }
    
}