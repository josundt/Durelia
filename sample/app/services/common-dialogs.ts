import { inject, singleton } from "durelia-framework";
import { IDialogService, DialogService, IDialogResult } from "durelia-dialog";
import { IMessageBoxModel, MessageBox } from "../views/_shared/messagebox";

export interface ICommonDialogs {
    messageBox(message: string, title?: string, options?: string[], cancelOptionIndex?: number): Promise<IDialogResult<string>>;
    confirm(message: string, title?: string): Promise<boolean>;
}

@singleton
@inject(DialogService)
export class CommonDialogs {
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

    async confirm(message: string, title?: string): Promise<boolean> {
        const result = await this.dialog.open<IMessageBoxModel, string>({
            viewModel: MessageBox,
            model: {
                message: message,
                title: title,
                options: ["OK", "Cancel"],
                cancelOptionIndex: 1
            }
        });
        return !result.wasCancelled;
    }
}