import * as durandalDialog from "plugins/dialog";
import {IDialogViewModel} from "durelia-viewmodel";
import {IDependencyInjectionContainer, inject, container, singleton} from "durelia-dependency-injection";

export interface IDialogOptions<TActivationModel> {
    viewModel: Function | Object;
    model: TActivationModel;
}

export interface IDialogService {
    open<TActivationModel, TResultOutput>(options: IDialogOptions<TActivationModel>): Promise<IDialogResult<TResultOutput>>;
    messageBox(message: string, title: string, buttonTexts: string[], options: { cancelButtonIndex: number }): Promise<IDialogResult<string>>;
    confirm(message: string, title?: string): Promise<boolean>;
}

export interface IDialogResult<TResultOutput> {
    wasCancelled: boolean;
    output: TResultOutput;
}

export interface IDialogController<TResultOutput> {
    ok(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>);
    cancel(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>);
}

@singleton
@inject(container)
export class DialogService implements IDialogService {
    
    constructor(container: IDependencyInjectionContainer) {
        this.container = container;
    }

    /** @internal */    
    private container: IDependencyInjectionContainer;
    
    open<TActivationModel, TResult>(options: IDialogOptions<TActivationModel>): Promise<IDialogResult<TResult>> {
        let vm = this.container.resolve<IDialogViewModel<TActivationModel, TResult>>(options.viewModel);
        return durandalDialog.show(vm, options.model) as any;
    }
    
    messageBox(message: string, title: string, buttonTexts: string[], options?: { cancelButtonIndex: number }): Promise<IDialogResult<string>> {
        return <any>durandalDialog.showMessage(message, title, buttonTexts)
            .then(buttonText => {
                return {
                    output: buttonText, 
                    wasCancelled: options && options.cancelButtonIndex && options.cancelButtonIndex === buttonTexts.indexOf(buttonText)
                };
            });
    }
    
    confirm(message: string, title?: string): Promise<boolean> {
        return <any>durandalDialog.showMessage(message, title, ["OK", "Cancel"])
            .then(buttonText => buttonText === "OK");
    }
}

export class DialogController<TResultOutput> implements IDialogController<TResultOutput> {
    ok(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>) {
        let dialogResult: IDialogResult<TResultOutput> = { 
            wasCancelled: false,
            output: result 
        };
        return durandalDialog.close(viewModel, dialogResult);
    }

    cancel(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>) {
        let dialogResult: IDialogResult<TResultOutput> = { 
            wasCancelled: false,
            output: result 
        };
        return durandalDialog.close(viewModel, { wasCancelled: true, output: result });
    }
}