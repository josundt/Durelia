import * as durandalDialog from "plugins/dialog";
import {IModalViewModel} from "app-base-viewmodel";
import {IDependencyInjectionContainer, inject, container, singleton} from "app-dependency-injection";

export interface IDialogOptions<TActivationModel> {
    viewModel: Function | Object;
    model: TActivationModel;
}

export interface IDialogService {
    open<TActivationModel, TResultOutput>(options: IDialogOptions<TActivationModel>): Promise<IDialogResult<TResultOutput>>;
    messageBox(message: string, title: string, buttonTexts: string[]): Promise<IDialogResult<string>>;
    confirm(message: string, title: string): Promise<boolean>;
}

export interface IDialogResult<TResultOutput> {
    wasCancelled: boolean;
    output: TResultOutput;
}

export interface IDialogController<TResultOutput> {
    ok(result: TResultOutput, viewModel: IModalViewModel<any, TResultOutput>);
    cancel(result: TResultOutput, viewModel: IModalViewModel<any, TResultOutput>);
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
        let vm = this.container.resolve<IModalViewModel<TActivationModel, TResult>>(options.viewModel);
        return durandalDialog.show(vm, options.model) as any;
    }
    
    messageBox(message: string, title: string, buttonTexts: string[]): Promise<IDialogResult<string>> {
        return durandalDialog.showMessage(message, title, buttonTexts) as any;
    }
    
    confirm(message: string, title: string): Promise<boolean> {
        return durandalDialog.showMessage(message, title, ["OK", "Cancel"])
            .then(buttonText => buttonText === "OK") as any;
    }
}

export class DialogController<TResultOutput> implements IDialogController<TResultOutput> {
    ok(result: TResultOutput, viewModel: IModalViewModel<any, TResultOutput>) {
        let dialogResult: IDialogResult<TResultOutput> = { 
            wasCancelled: false,
            output: result 
        };
        return durandalDialog.close(viewModel, dialogResult);
    }

    cancel(result: TResultOutput, viewModel: IModalViewModel<any, TResultOutput>) {
        let dialogResult: IDialogResult<TResultOutput> = { 
            wasCancelled: false,
            output: result 
        };
        return durandalDialog.close(viewModel, { wasCancelled: true, output: result });
    }
}