export interface IViewModel<TActivationOptions> {
    canActivate?(): Promise<boolean>;
    activate?(options?: TActivationOptions): Promise<any>;
    canDeactivate?(): Promise<boolean>;
    deactivate?(): Promise<any>;
}

export interface IDialogViewModel<TActivationOptions, TDialogResult> extends IViewModel<TActivationOptions> {
}
