export interface IViewModel<TActivationModel> {
    canActivate?(options?: TActivationModel): Promise<boolean>;
    activate?(options?: TActivationModel): Promise<any>;
    canDeactivate?(): Promise<boolean>;
    deactivate?(): Promise<any>;
}

export interface IDialogViewModel<TActivationModel, TResultOutput> extends IViewModel<TActivationModel> {
}
