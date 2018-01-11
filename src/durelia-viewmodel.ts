export interface IViewModel<TActivationModel> {
    canActivate?(options?: TActivationModel): Promise<boolean> | boolean;
    activate?(options?: TActivationModel): Promise<any> | any | void;
    canDeactivate?(): Promise<boolean> | boolean;
    deactivate?(): Promise<any> | any | void;
}

// tslint:disable-next-line:no-unused-variable
export interface IDialogViewModel<TActivationModel, TResultOutput> extends IViewModel<TActivationModel> {
}
