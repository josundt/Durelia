import * as durandalDialog from "plugins/dialog";
import {IModalViewModel} from "base/viewmodel";
import {IDependencyInjectionContainer, container, singleton} from "dependency-injection";

export interface IDialogHelper {
    
    showModal<TActivationOptions, TDialogResult>(
        viewModelType: Function | Object, 
        options: TActivationOptions
    ): Promise<TDialogResult>;
    
    messageBox(message: string, title: string, buttonTexts: string[]): Promise<string>;
    
    confirm(message: string, title: string): Promise<boolean>;
    
    closeModal<TDialogResult>(
        viewModel: IModalViewModel<any, TDialogResult>, 
        result: TDialogResult
    ): void;
}

@singleton
export class DialogHelper implements IDialogHelper {
    static inject = () => [container];
    
    constructor(
        private container: IDependencyInjectionContainer
    ) {}
    
    showModal<TActivationOptions, TDialogResult>(
        viewModelType: Function | Object, 
        options: TActivationOptions
    ): Promise<TDialogResult> {
        let vm = this.container.resolve<IModalViewModel<TActivationOptions, TDialogResult>>(viewModelType);
        return durandalDialog.show(vm, options) as any;
    }
    
    messageBox(message: string, title: string, buttonTexts: string[]): Promise<string> {
        return durandalDialog.showMessage(message, title, buttonTexts) as any;
    }
    
    confirm(message: string, title: string): Promise<boolean> {
        return durandalDialog.showMessage(message, title, ["OK", "Cancel"]).then((buttonText) => buttonText === "OK") as any;
    }
    
    closeModal<TDialogResult>(viewmodel: IModalViewModel<any, TDialogResult>, result: TDialogResult): void {
        return durandalDialog.close(viewmodel, result);
    }
}