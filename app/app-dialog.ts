import * as durandalDialog from "plugins/dialog";
import {IModalViewModel} from "base/viewmodel";
import {IDependencyInjectionContainer, inject, container, singleton} from "framework/dependency-injection";

export interface IDialogOptions<TModel> {
    viewModel: Function | Object;
    model: TModel;
}

export interface IDialogService {
    open<TModel, TResult>(options: IDialogOptions<TModel>): Promise<IDialogResult<TResult>>;
    
    messageBox(message: string, title: string, buttonTexts: string[]): Promise<IDialogResult<string>>;
    
    confirm(message: string, title: string): Promise<IDialogResult<boolean>>;
}

export interface IDialogResult<TResult> {
    wasCancelled: boolean;
    output: TResult;
}

export interface IDialogController<TResult> {
    ok(result: TResult, viewModel: IModalViewModel<any, TResult>);
    cancel(result: TResult, viewModel: IModalViewModel<any, TResult>);
}

@singleton
@inject(container)
export class DialogService implements IDialogService {
    
    constructor(
        private container: IDependencyInjectionContainer
    ) {}
    
    open<TModel, TResult>(options: IDialogOptions<TModel>): Promise<IDialogResult<TResult>> {
        let vm = this.container.resolve<IModalViewModel<TModel, TResult>>(options.viewModel);
        return durandalDialog.show(vm, options.model) as any;
    }
    
    messageBox(message: string, title: string, buttonTexts: string[]): Promise<IDialogResult<string>> {
        return durandalDialog.showMessage(message, title, buttonTexts) as any;
    }
    
    confirm(message: string, title: string): Promise<IDialogResult<boolean>> {
        return durandalDialog.showMessage(message, title, ["OK", "Cancel"])
            .then((buttonText) => {
                return {
                    wasCancelled: buttonText === "Cancel",
                    output: buttonText === "Cancel"
                } 
            })as any;
    }
}

export class DialogController<TResult> implements IDialogController<TResult> {
    ok(result: TResult, viewModel: IModalViewModel<any, TResult>) {
        return durandalDialog.close(viewModel, { wasCancelled: false, result});
    }

    cancel(result: TResult, viewModel: IModalViewModel<any, TResult>) {
        return durandalDialog.close(viewModel, { wasCancelled: true, result});
    }
}