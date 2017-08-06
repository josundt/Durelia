declare module "durelia-dialog" {
    import { IDialogViewModel } from "durelia-viewmodel";
    import { IDependencyInjectionContainer } from "durelia-dependency-injection";
    export interface IDialogOptions<TActivationModel> {
        viewModel: Function | object;
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
        ok(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>): void;
        cancel(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>): void;
    }
    export class DialogService implements IDialogService {
        constructor(container: IDependencyInjectionContainer);
        open<TActivationModel, TResult>(options: IDialogOptions<TActivationModel>): Promise<IDialogResult<TResult>>;
    }
    export class DialogController<TResultOutput> implements IDialogController<TResultOutput> {
        ok(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>): void;
        cancel(result: TResultOutput, viewModel: IDialogViewModel<any, TResultOutput>): void;
    }
    
}