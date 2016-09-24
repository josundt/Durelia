import * as durandalDialog from "plugins/dialog";
import {IDialogViewModel} from "durelia-viewmodel";
import {IDependencyInjectionContainer, DependencyInjectionContainer, inject, singleton} from "durelia-dependency-injection";

export interface IDialogOptions<TActivationModel> {
    viewModel: Function | Object;
    model: TActivationModel;
}

export interface IDialogService {
    open<TActivationModel, TResultOutput>(options: IDialogOptions<TActivationModel>): Promise<IDialogResult<TResultOutput>>;
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
@inject(DependencyInjectionContainer)
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
            wasCancelled: true,
            output: result 
        };
        return durandalDialog.close(viewModel, dialogResult);
    }
}