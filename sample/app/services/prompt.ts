import {inject, singleton} from "durelia-framework";
import {IDialogService, DialogService, IDialogResult} from "durelia-dialog";
import {MessageBox, IMessageBoxModel} from "views/_shared/messagebox";

export interface IPromptService {
    messageBox(message: string, title?: string, options?: string[], cancelOptionIndex?: number): Promise<IDialogResult<string>>;
    confirm(message: string, title?: string): Promise<boolean>;
}

@singleton
@inject(DialogService)
export class PromptService {
    constructor(
        private dialog: IDialogService
    ) {}
    
    messageBox(message: string, title?: string, options?: string[], cancelOptionIndex?: number): Promise<IDialogResult<string>> {
        return this.dialog.open<IMessageBoxModel, string>({
            viewModel: MessageBox, 
            model: {
                message: message,
                title: title,
                options: options,
                cancelOptionIndex: cancelOptionIndex
            }
        });
    }
    
    confirm(message: string, title?: string): Promise<boolean> {
        return this.dialog.open<IMessageBoxModel, string>({
            viewModel: MessageBox, 
            model: {
                message: message,
                title: title,
                options: ["OK", "Cancel"],
                cancelOptionIndex: 1
            }
        }).then(result => !result.wasCancelled);
    }
} 